import { usePipelineStore, STAGE_NAMES } from '@/store/usePipelineStore';
import { usePipelineSocket } from '@/hooks/usePipelineSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  RUNNING: 'default',
  DONE: 'secondary',
  ERROR: 'destructive',
  VETOED: 'destructive',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Aguardando',
  RUNNING: '▶ Processando',
  DONE: '✓ Concluído',
  ERROR: '✕ Erro',
  VETOED: '⛔ Vetado',
};

export function PipelineProgressPage() {
  usePipelineSocket();

  const {
    activeProcessId,
    pipelineStatus,
    stages,
    totalTokens,
    totalCost,
  } = usePipelineStore();

  const completedCount = stages.filter((s) => s.status === 'DONE').length;
  const progressPct = Math.round((completedCount / 13) * 100);

  if (!activeProcessId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nenhum pipeline ativo. Crie uma nova petição.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      {/* Header com totais */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Pipeline #{activeProcessId}</h1>
          <p className="text-sm text-muted-foreground">
            Status: <span className="font-medium">{pipelineStatus}</span>
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">Tokens</span>
            <span className="font-mono font-bold">{totalTokens.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">Custo</span>
            <span className="font-mono font-bold text-green-600">R$ {totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar global */}
      <Progress value={progressPct} className="h-2" />
      <p className="text-xs text-muted-foreground text-center">{completedCount}/13 estágios concluídos</p>

      {/* Cards por estágio */}
      <div className="flex flex-col gap-3">
        {stages.map((stage) => (
          <Card
            key={stage.stage}
            className={`transition-all ${
              stage.status === 'RUNNING' ? 'border-primary shadow-md ring-1 ring-primary/20' : ''
            } ${stage.status === 'ERROR' ? 'border-destructive' : ''}`}
          >
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground w-6 text-right">{stage.stage}</span>
                  <CardTitle className="text-sm font-medium">
                    {STAGE_NAMES[stage.stage] || `Estágio ${stage.stage}`}
                  </CardTitle>
                  {stage.status === 'RUNNING' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <Badge variant={STATUS_VARIANT[stage.status] || 'outline'}>
                  {STATUS_LABEL[stage.status] || stage.status}
                </Badge>
              </div>
            </CardHeader>
            {(stage.status === 'DONE' || stage.status === 'ERROR') && (
              <CardContent className="px-4 pb-3 pt-0">
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {stage.tokensUsed > 0 && <span>Tokens: {stage.tokensUsed}</span>}
                  {stage.cost > 0 && <span>R$ {stage.cost.toFixed(2)}</span>}
                  {stage.durationMs > 0 && <span>{(stage.durationMs / 1000).toFixed(1)}s</span>}
                </div>
                {stage.error && (
                  <p className="text-xs text-destructive mt-1">{stage.error}</p>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Disclaimer obrigatório (FR24) */}
      <div className="bg-muted/50 border rounded-lg p-3 text-xs text-muted-foreground text-center">
        ⚖️ Este documento foi gerado com auxílio de inteligência artificial e deve ser obrigatoriamente revisado por advogado(a) habilitado(a) na OAB antes de utilização.
      </div>
    </div>
  );
}
