import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface Section {
  id: string;
  title: string;
  route: string; // rota onde esta seção é contextualmente relevante
  content: string;
}

const MANUAL_SECTIONS: Section[] = [
  {
    id: 'overview', title: '📖 Visão Geral', route: '/',
    content: `O OpenDoc é uma plataforma de peticionamento jurídico assistido por IA. O fluxo é:\n\n1. Crie uma Nova Petição com brief e documentos\n2. O Pipeline de 13 estágios processa automaticamente\n3. Revise e refine com a IA na tela de Discussão\n4. Exporte o documento final em PDF com Visual Law`,
  },
  {
    id: 'new-petition', title: '📝 Nova Petição', route: '/nova-peticao',
    content: `Selecione o tipo de petição (Inicial, Contestação, etc.), descreva a tese jurídica no campo Brief e opcionalmente anexe documentos.\n\nFormatos suportados: PDF, DOCX, XLS, imagens (PNG/JPG), áudio (MP3/WAV).\nLimite: 50MB por arquivo, 200MB por processo.\n\nAo clicar "Criar Petição", o Pipeline inicia automaticamente.`,
  },
  {
    id: 'pipeline', title: '⚙️ Pipeline', route: '/pipeline',
    content: `O Pipeline possui 13 estágios executados em sequência:\n\n1. Ingestão → 2. Conversão (OCR/PDF) → 3. Validação → 4. Anonimização LGPD → 5. Pseudonimização → 6. Roteamento → 7. Agente Especialista → 8. Jurisprudência → 9. Redação → 10. Checkpoint Humano → 11. Visual Law → 12. Restauração → 13. Exportação\n\nAcompanhe tokens consumidos e custo em tempo real.`,
  },
  {
    id: 'discussion', title: '💬 Discussão H↔IA', route: '/discussion',
    content: `Após o Pipeline, refine a peça com a IA:\n\n- O painel esquerdo mostra o rascunho editável\n- O painel direito é o chat com a IA\n- Sugestões de edição aparecem como blocos diff (verde/vermelho)\n- Aceite ou rejeite cada sugestão individualmente\n- Exporte o PDF final quando satisfeito`,
  },
  {
    id: 'deadlines', title: '📅 Prazos', route: '/deadlines',
    content: `Gerencie prazos processuais com alertas automáticos:\n\n- Crie prazos vinculados a processos\n- Prioridades: Baixa, Normal, Alta, Urgente\n- Notificações 48h e 24h antes do vencimento\n- Visualize prazos próximos e vencidos`,
  },
  {
    id: 'financials', title: '💰 Financeiro', route: '/financials',
    content: `Controle honorários e custas por processo:\n\n- Registre honorários (receitas) e custas/taxas (despesas)\n- Veja o fluxo de caixa consolidado\n- Marque pagamentos recebidos\n- Filtre por período`,
  },
  {
    id: 'settings', title: '⚙️ Configurações', route: '/settings',
    content: `Área administrativa (apenas ADMIN):\n\n- Branding: logo, cores, disclaimer personalizado\n- Integrações LLM: cadastre chaves de API (criptografadas AES-256)\n- Gastos: monitore consumo de tokens por organização`,
  },
  {
    id: 'security', title: '🔒 Segurança', route: '/',
    content: `O OpenDoc implementa segurança de nível empresarial:\n\n- Autenticação 2FA obrigatória (TOTP)\n- Senhas com Argon2id + pepper\n- Dados anonimizados antes de envio ao LLM (AES-256-GCM)\n- Audit trail imutável com hash chain SHA-256\n- Isolamento total entre organizações (schemas separados)\n- API keys criptografadas em repouso`,
  },
];

export function HelpManual() {
  const location = useLocation();
  const [search, setSearch] = useState('');

  // Filtrar e ordenar (contextual primeiro)
  const filtered = MANUAL_SECTIONS
    .filter(s => {
      if (!search) return true;
      const q = search.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const aMatch = location.pathname.startsWith(a.route) && a.route !== '/' ? -1 : 0;
      const bMatch = location.pathname.startsWith(b.route) && b.route !== '/' ? -1 : 0;
      return aMatch - bMatch;
    });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs gap-1">
          <span>❓</span> Ajuda
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[420px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Manual do OpenDoc</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <Input
            placeholder="Buscar no manual..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="flex flex-col gap-5 pr-4">
              {filtered.map(section => (
                <div key={section.id}>
                  <h3 className="text-sm font-bold mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
