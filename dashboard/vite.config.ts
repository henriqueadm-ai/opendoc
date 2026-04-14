import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { teamWatcherPlugin } from "./src/plugin/teamWatcher";

export default defineConfig({
  plugins: [react(), tailwindcss(), teamWatcherPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
