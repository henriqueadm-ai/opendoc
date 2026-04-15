import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// ─── Types ───────────────────────────────────────────────────────────────────
interface DiscussionMessage {
  id: number;
  sender: 'AI' | 'HUMAN';
  message: string;
  diff_old: string | null;
  diff_new: string | null;
  diff_status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
  created_at: string;
}

interface ProcessInfo {
  id: number;
  type: string;
  brief: string;
  status: string;
}

// ─── DiffBlock ──────────────────────────────────────────────────────────────
function DiffBlock({
  msgId,
  diffOld,
  diffNew,
  status,
  onAccept,
  onReject,
}: {
  msgId: number;
  diffOld: string;
  diffNew: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) {
  return (
    <div className="mt-3 rounded-lg border overflow-hidden text-xs">
      <div className="bg-red-950/30 border-b border-red-800/40 px-3 py-2 font-mono whitespace-pre-wrap text-red-300">
        <span className="text-red-500 font-bold mr-1">−</span>{diffOld}
      </div>
      <div className="bg-green-950/30 px-3 py-2 font-mono whitespace-pre-wrap text-green-300">
        <span className="text-green-500 font-bold mr-1">+</span>{diffNew}
      </div>
      {status === 'PENDING' && (
        <div className="flex gap-2 p-2 bg-muted/30">
          <Button size="sm" className="h-6 text-xs" onClick={() => onAccept(msgId)}>✓ Aceitar</Button>
          <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => onReject(msgId)}>✕ Rejeitar</Button>
        </div>
      )}
      {status === 'ACCEPTED' && (
        <div className="px-3 py-1.5 bg-green-950/30 text-green-400 text-xs font-medium">✓ Aceita — aplicada ao rascunho</div>
      )}
      {status === 'REJECTED' && (
        <div className="px-3 py-1.5 bg-muted/30 text-muted-foreground text-xs">✕ Rejeitada</div>
      )}
    </div>
  );
}

// ─── ChatBubble ──────────────────────────────────────────────────────────────
function ChatBubble({
  msg,
  onAccept,
  onReject,
}: {
  msg: DiscussionMessage;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const isHuman = msg.sender === 'HUMAN';
  const time = new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Remover a parte DIFF_OLD/DIFF_NEW do texto exibido
  const displayText = msg.message
    .replace(/DIFF_OLD:[\s\S]*?(?=DIFF_NEW:|$)/g, '')
    .replace(/DIFF_NEW:[\s\S]*/g, '')
    .trim();

  return (
    <div className={`flex gap-3 ${isHuman ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isHuman ? 'bg-primary text-primary-foreground' : 'bg-violet-700 text-white'}`}>
        {isHuman ? 'A' : 'IA'}
      </div>
      <div className={`max-w-[85%] flex flex-col gap-1 ${isHuman ? 'items-end' : 'items-start'}`}>
        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isHuman ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
          {displayText}
          {msg.diff_old && msg.diff_new && (
            <DiffBlock
              msgId={msg.id}
              diffOld={msg.diff_old}
              diffNew={msg.diff_new}
              status={msg.diff_status}
              onAccept={onAccept}
              onReject={onReject}
            />
          )}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{time}</span>
      </div>
    </div>
  );
}

// ─── Page Principal ──────────────────────────────────────────────────────────
export function DiscussionPage() {
  const { processId } = useParams<{ processId: string }>();
  const [process, setProcess] = useState<ProcessInfo | null>(null);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchDiscussion = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/processes/${processId}/discussion`);
      const d = await res.json();
      setProcess(d.data.process);
      setMessages(d.data.messages);
      // O draft começa com o brief do processo
      if (!draft && d.data.process?.brief) setDraft(d.data.process.brief);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiscussion(); }, [processId]);

  // Auto-scroll para o fim ao receber nova mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Aplicar diffs aceitos ao rascunho
  useEffect(() => {
    const lastAccepted = [...messages]
      .reverse()
      .find(m => m.diff_status === 'ACCEPTED' && m.diff_new);
    if (lastAccepted?.diff_new) {
      setDraft(prev => prev.replace(lastAccepted.diff_old || '', lastAccepted.diff_new!));
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const userMsg = input;
    setInput('');
    try {
      const res = await apiFetch(`/api/processes/${processId}/discussion`, {
        method: 'POST',
        body: JSON.stringify({ message: userMsg, current_draft: draft }),
      });
      const d = await res.json();
      // Adicionar mensagem humana + resposta da IA
      setMessages(prev => [
        ...prev,
        { id: Date.now(), sender: 'HUMAN', message: userMsg, diff_old: null, diff_new: null, diff_status: null, created_at: new Date().toISOString() },
        d.data,
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleDiffAction = async (msgId: number, action: 'ACCEPTED' | 'REJECTED') => {
    await apiFetch(`/api/processes/${processId}/discussion/${msgId}/diff`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    });
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, diff_status: action } : m));
  };

  const handleExportPdf = () => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/processes/${processId}/export/pdf`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-muted-foreground">Carregando...</p></div>;

  return (
    <div className="flex h-full gap-0">
      {/* ── Painel Esquerdo: Draft Editor ─────────────── */}
      <div className="flex flex-col flex-1 border-r">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <p className="text-sm font-semibold">Rascunho da Peça</p>
            {process && (
              <p className="text-xs text-muted-foreground">
                {process.type} · Processo #{process.id}
              </p>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={handleExportPdf}>
            ↓ Exportar PDF
          </Button>
        </div>
        <Textarea
          className="flex-1 resize-none font-mono text-sm border-none rounded-none focus-visible:ring-0 leading-relaxed p-4"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="O rascunho da petição aparecerá aqui após o pipeline..."
        />
      </div>

      {/* ── Painel Direito: Chat IA ────────────────────── */}
      <div className="flex flex-col w-[420px] shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="text-sm font-semibold">Discussão H↔IA</p>
          <Badge variant="secondary">{messages.length} mensagens</Badge>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="flex flex-col gap-4 py-4">
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhuma mensagem ainda. Inicie a revisão!
              </p>
            )}
            {messages.map(msg => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                onAccept={(id) => handleDiffAction(id, 'ACCEPTED')}
                onReject={(id) => handleDiffAction(id, 'REJECTED')}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-3 flex gap-2">
          <Textarea
            className="resize-none text-sm"
            rows={2}
            placeholder="Peça uma revisão, ajuste de tom ou melhoria específica..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={sending || !input.trim()} className="h-full">
            {sending ? '...' : '→'}
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center px-3 pb-2 leading-tight">
          ⚖️ Conteúdo gerado por IA. Revisão obrigatória por advogado habilitado na OAB.
        </p>
      </div>
    </div>
  );
}
