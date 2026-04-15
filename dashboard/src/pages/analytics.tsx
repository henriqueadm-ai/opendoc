import { useState, useEffect } from 'react';
import { apiFetch } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProductivityData {
  total_processes: number;
  completed_processes: number;
  completion_rate: string;
  by_type: { type: string; _count: number }[];
  by_user: { created_by: number; _count: number }[];
  tokens: { total: number; cost: number };
}

interface TokenCostData {
  by_agent: { agent: string; tokens: number; cost: number; runs: number }[];
  total_cost: number;
}

export function AnalyticsPage() {
  const [productivity, setProductivity] = useState<ProductivityData | null>(null);
  const [tokenCosts, setTokenCosts] = useState<TokenCostData | null>(null);

  useEffect(() => {
    apiFetch('/api/analytics/productivity').then(r => r.json()).then(d => setProductivity(d.data));
    apiFetch('/api/analytics/token-costs').then(r => r.json()).then(d => setTokenCosts(d.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-8">
      <h1 className="text-xl font-bold">Analytics & Produtividade</h1>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Total Processos</p>
          <p className="text-3xl font-bold">{productivity?.total_processes ?? '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Concluídos</p>
          <p className="text-3xl font-bold text-green-600">{productivity?.completed_processes ?? '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Taxa Conclusão</p>
          <p className="text-3xl font-bold">{productivity?.completion_rate ?? '—'}%</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Custo Total IA</p>
          <p className="text-3xl font-bold text-violet-600">
            R$ {(productivity?.tokens.cost ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {(productivity?.tokens.total ?? 0).toLocaleString()} tokens
          </p>
        </CardContent></Card>
      </div>

      {/* Processos por tipo */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Processos por Tipo</CardTitle></CardHeader>
        <CardContent>
          {!productivity?.by_type?.length ? (
            <p className="text-sm text-muted-foreground">Sem dados.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {productivity.by_type.map(t => {
                const pct = productivity.total_processes > 0
                  ? (t._count / productivity.total_processes) * 100
                  : 0;
                return (
                  <div key={t.type} className="flex items-center gap-3">
                    <Badge variant="outline" className="w-28 justify-center text-xs">{t.type}</Badge>
                    <Progress value={pct} className="h-2 flex-1" />
                    <span className="text-xs font-mono w-10 text-right">{t._count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custos por Agent */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Custos por Agente IA</CardTitle>
            {tokenCosts && (
              <span className="text-sm font-bold text-violet-600">
                Total: R$ {tokenCosts.total_cost.toFixed(2)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!tokenCosts?.by_agent?.length ? (
            <p className="text-sm text-muted-foreground">Sem dados.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {tokenCosts.by_agent.map(a => (
                <div key={a.agent} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{a.agent}</span>
                    <span className="text-xs text-muted-foreground">({a.runs} runs)</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">{a.tokens.toLocaleString()} tokens</span>
                    <span className="font-mono font-bold">R$ {a.cost.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
