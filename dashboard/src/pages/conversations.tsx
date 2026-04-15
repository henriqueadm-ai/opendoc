import { useState, useEffect } from 'react';
import { apiFetch } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
  id: number;
  client_name: string;
  client_phone: string;
  channel: string;
  status: 'ACTIVE' | 'ESCALATED' | 'CLOSED';
  sentiment: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  ESCALATED: 'destructive',
  CLOSED: 'secondary',
};

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    apiFetch('/api/whatsapp/conversations')
      .then(r => r.json())
      .then(d => setConversations(d.data || []));
  }, []);

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      await apiFetch(`/api/whatsapp/conversations/${selected.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: reply }),
      });
      setReply('');
      // Mover para ACTIVE após resposta
      setConversations(prev =>
        prev.map(c => c.id === selected.id ? { ...c, status: 'ACTIVE' as const } : c)
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full gap-0">
      {/* Lista de conversas */}
      <div className="w-80 border-r flex flex-col shrink-0">
        <div className="px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">Atendimento</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {conversations.filter(c => c.status === 'ESCALATED').length} escalações pendentes
          </p>
        </div>
        <ScrollArea className="flex-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              className={`w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors ${
                selected?.id === conv.id ? 'bg-muted' : ''
              }`}
              onClick={() => setSelected(conv)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate">{conv.client_name || conv.client_phone}</span>
                <Badge variant={STATUS_COLORS[conv.status]} className="text-[10px] h-5">
                  {conv.status === 'ESCALATED' ? '🔴 Escalar' : conv.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {conv.channel === 'whatsapp' ? '💬' : '📷'} {conv.channel}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(conv.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma conversa ativa</p>
          )}
        </ScrollArea>
      </div>

      {/* Área de resposta */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{selected.client_name || selected.client_phone}</p>
                <p className="text-xs text-muted-foreground">{selected.client_phone} · {selected.channel}</p>
              </div>
              {selected.sentiment && (
                <Badge variant="outline" className="text-xs">
                  Sentimento: {selected.sentiment}
                </Badge>
              )}
            </div>
            <div className="flex-1 p-4 bg-muted/20">
              <p className="text-sm text-muted-foreground text-center py-12">
                Histórico de mensagens será carregado aqui.<br />
                <span className="text-xs">(Integração com WhatsApp Business API)</span>
              </p>
            </div>
            <div className="border-t p-3 flex gap-2">
              <Textarea
                className="resize-none text-sm"
                rows={2}
                placeholder="Responder ao cliente..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); }
                }}
              />
              <Button onClick={handleReply} disabled={sending || !reply.trim()} className="h-full">
                {sending ? '...' : 'Enviar'}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">Selecione uma conversa para responder</p>
          </div>
        )}
      </div>
    </div>
  );
}
