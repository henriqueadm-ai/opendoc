import type { Plugin, ViteDevServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { watch as chokidarWatch } from "chokidar";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { TeamInfo, TeamState, WsMessage } from "../types/state";

function resolveTeamsDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "../teams"),  // started from dashboard/
    path.resolve(process.cwd(), "teams"),     // started from project root
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), "../teams"); // default (will be created on demand)
}

async function discoverTeams(teamsDir: string): Promise<TeamInfo[]> {
  let entries;
  try {
    entries = await fsp.readdir(teamsDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const teams: TeamInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const yamlPath = path.join(teamsDir, entry.name, "team.yaml");
    try {
      const raw = await fsp.readFile(yamlPath, "utf-8");
      const parsed = parseYaml(raw);
      const s = parsed?.team;
      if (s) {
        teams.push({
          code: typeof s.code === "string" ? s.code : entry.name,
          name: typeof s.name === "string" ? s.name : entry.name,
          description: typeof s.description === "string" ? s.description : "",
          icon: typeof s.icon === "string" ? s.icon : "\u{1F4CB}",
          agents: Array.isArray(s.agents) ? (s.agents as unknown[]).filter((a): a is string => typeof a === "string") : [],
        });
        continue;
      }
    } catch {
      // No team.yaml or invalid YAML — fall through to default
    }

    teams.push({
      code: entry.name,
      name: entry.name,
      description: "",
      icon: "\u{1F4CB}",
      agents: [],
    });
  }

  return teams;
}

function isValidState(data: unknown): data is TeamState {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.status === "string" &&
    d.step != null && typeof d.step === "object" &&
    Array.isArray(d.agents)
  );
}

async function readActiveStates(teamsDir: string): Promise<Record<string, TeamState>> {
  const states: Record<string, TeamState> = {};

  let entries;
  try {
    entries = await fsp.readdir(teamsDir, { withFileTypes: true });
  } catch {
    return states;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statePath = path.join(teamsDir, entry.name, "state.json");

    try {
      const raw = await fsp.readFile(statePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (isValidState(parsed)) {
        states[entry.name] = parsed;
      }
    } catch {
      // Skip missing or invalid JSON
    }
  }

  return states;
}

async function buildSnapshot(teamsDir: string): Promise<WsMessage> {
  return {
    type: "SNAPSHOT",
    teams: await discoverTeams(teamsDir),
    activeStates: await readActiveStates(teamsDir),
  };
}

function broadcast(wss: WebSocketServer, msg: WsMessage) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch {
        // Client connection dying — ws library will clean it up
      }
    }
  }
}

export function teamWatcherPlugin(): Plugin {
  return {
    name: "team-watcher",
    configureServer(server: ViteDevServer) {
      if (!server.httpServer) {
        server.config.logger.warn("[team-watcher] no httpServer — skipping");
        return;
      }

      const teamsDir = resolveTeamsDir();
      server.config.logger.info(`[team-watcher] teams dir: ${teamsDir}`);

      // Create WebSocket server with noServer to avoid intercepting Vite's HMR
      const wss = new WebSocketServer({ noServer: true });
      (server.httpServer as Server).on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        if (req.url === "/__teams_ws") {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
          });
        }
        // Let Vite handle all other upgrade requests (HMR)
      });

      // Send snapshot on new connection
      wss.on("connection", async (ws) => {
        try {
          const snap = await buildSnapshot(teamsDir);
          ws.send(JSON.stringify(snap));
        } catch {
          // Connection may have closed before snapshot was ready
        }
      });

      // Ensure teams directory exists
      fsp.mkdir(teamsDir, { recursive: true }).catch((err) => {
        server.config.logger.error(`[team-watcher] failed to create teams dir: ${err.message}`);
      });

      // REST API fallback & File Upload
      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/api/snapshot" && req.method === "GET") {
          try {
            const snapshot = await buildSnapshot(teamsDir);
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Cache-Control", "no-cache");
            res.end(JSON.stringify(snapshot));
          } catch {
            res.writeHead(500);
            res.end("Internal Server Error");
          }
          return;
        }

        if (req.url === "/api/upload" && req.method === "POST") {
          import("busboy").then(({ default: Busboy }) => {
            const busboy = Busboy({ headers: req.headers });
            let caseId = "";
            let processosDir = path.resolve(process.cwd(), "../PROCESSOS");
            if (!fs.existsSync(processosDir)) {
              processosDir = path.resolve(process.cwd(), "PROCESSOS");
            }
            
            const filePromises: Promise<void>[] = [];

            busboy.on("field", (fieldname, val) => {
              if (fieldname === "caseId") {
                caseId = val.replace(/[^a-zA-Z0-9_-]/g, ""); // sanitize
              }
            });

            busboy.on("file", (_fieldname, file, info) => {
              const { filename } = info;
              if (!caseId) {
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, "0");
                const mm = String(today.getMonth() + 1).padStart(2, "0");
                const yyyy = today.getFullYear();
                const prefix = `${dd}_${mm}_${yyyy}_`;
                
                let maxNum = 0;
                try {
                  const dirs = fs.readdirSync(processosDir, { withFileTypes: true });
                  for (const dir of dirs) {
                    if (dir.isDirectory() && dir.name.startsWith(prefix)) {
                      const numStr = dir.name.substring(prefix.length);
                      const num = parseInt(numStr, 10);
                      if (!isNaN(num) && num > maxNum) {
                        maxNum = num;
                      }
                    }
                  }
                } catch {
                  // Directroy might not exist yet
                }
                
                const sequential = String(maxNum + 1).padStart(4, "0");
                caseId = `${prefix}${sequential}`;
              }
              const targetDir = path.join(processosDir, caseId);
              
              filePromises.push(
                fsp.mkdir(targetDir, { recursive: true }).then(() => {
                  const saveTo = path.join(targetDir, filename.replace(/[^a-zA-Z0-9_.-]/g, "_"));
                  return new Promise((resolve, reject) => {
                    const writeStream = fs.createWriteStream(saveTo);
                    file.pipe(writeStream);
                    writeStream.on("finish", resolve);
                    writeStream.on("error", reject);
                  });
                })
              );
            });

            busboy.on("finish", async () => {
              try {
                await Promise.all(filePromises);
                res.writeHead(200, { Connection: "close", "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true, caseId }));
              } catch (err: any) {
                res.writeHead(500, { Connection: "close", "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });

            req.pipe(busboy);
          }).catch(err => {
             res.writeHead(500);
             res.end(JSON.stringify({ error: err.message }));
          });
          return;
        }

        if (req.url?.startsWith("/api/team/") && req.url?.endsWith("/checkpoint") && req.method === "POST") {
          const parts = req.url.split("/");
          const teamName = parts[3];
          let body = "";
          req.on("data", chunk => body += chunk.toString());
          req.on("end", async () => {
            try {
              const payload = JSON.parse(body);
              const checkpointFile = path.join(teamsDir, teamName, "checkpoint_response.json");
              await fsp.writeFile(checkpointFile, JSON.stringify(payload, null, 2), "utf-8");

              const stateFile = path.join(teamsDir, teamName, "state.json");
              try {
                const stateRaw = await fsp.readFile(stateFile, "utf-8");
                const state = JSON.parse(stateRaw);
                state.status = "running"; // Clear checkpoint status on UI
                if (state.agents) {
                  state.agents.forEach((a: any) => {
                    if (a.status === "checkpoint") a.status = "working";
                  });
                }
                state.updatedAt = new Date().toISOString();
                await fsp.writeFile(stateFile, JSON.stringify(state, null, 2), "utf-8");
              } catch (e) {
                // Ignore state.json update errors
              }

              res.setHeader("Content-Type", "application/json");
              res.writeHead(200);
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.setHeader("Content-Type", "application/json");
              res.writeHead(400);
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        return next();
      });

      // File watcher using chokidar — reliable cross-platform, handles partial writes
      const watcher = chokidarWatch(teamsDir, {
        ignoreInitial: true,
        awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 50 },
        ignored: [/(^|[/\\])\./, /node_modules/, /output[/\\]/],
        depth: 2,
      });

      function handleFileChange(filePath: string) {
        const relative = path.relative(teamsDir, filePath).replace(/\\/g, "/");
        const parts = relative.split("/");
        if (parts.length < 2) return;

        const teamName = parts[0];
        const fileName = parts[1];

        if (fileName === "state.json") {
          fsp.readFile(filePath, "utf-8").then((raw) => {
            const parsed = JSON.parse(raw);
            if (!isValidState(parsed)) return;
            broadcast(wss, { type: "TEAM_UPDATE", team: teamName, state: parsed });
          }).catch(() => {
            // Invalid JSON — next change event will retry
          });
        } else if (fileName === "team.yaml") {
          buildSnapshot(teamsDir).then((snap) => broadcast(wss, snap));
        }
      }

      function handleFileRemoval(filePath: string) {
        const relative = path.relative(teamsDir, filePath).replace(/\\/g, "/");
        const parts = relative.split("/");
        if (parts.length < 2) return;

        const teamName = parts[0];
        const fileName = parts[1];

        if (fileName === "state.json") {
          broadcast(wss, { type: "TEAM_INACTIVE", team: teamName });
        } else if (fileName === "team.yaml") {
          buildSnapshot(teamsDir).then((snap) => broadcast(wss, snap));
        }
      }

      watcher.on("add", handleFileChange);
      watcher.on("change", handleFileChange);
      watcher.on("unlink", handleFileRemoval);

      server.httpServer.on("close", () => {
        watcher.close();
      });
    },
  };
}

