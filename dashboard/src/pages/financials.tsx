import { useState, useEffect } from 'react';
import { apiFetch } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Fee {
  id: number;
  process_id: number;
  type: string;
  description: string;
  amount: string;
  paid: boolean;
  due_date: string | null;
  process?: { id: number; case_id: string; type: string };
}

interface Summary {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
  count: number;
}

const TYPE_LABELS: Record<string, string> = {
  HONORARIO: '💰 Honorário',
  CUSTA: '📄 Custa',
  TAXA: '🏛️ Taxa',
  OUTRO: '📌 Outro',
};

export function FinancialsPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [summary, setSummary] = useState<Summary>({ total_receitas: 0, total_despesas: 0, saldo: 0, count: 0 });

  useEffect(() => {
    apiFetch('/api/financials')
      .then(r => r.json())
      .then(d => {
        setFees(d.data?.fees || []);
        setSummary(d.data?.summary || summary);
      });
  }, []);

  const handlePay = async (id: number) => {
    await apiFetch(`/api/financials/${id}/pay`, { method: 'PUT' });
    setFees(prev => prev.map(f => f.id === id ? { ...f, paid: true } : f));
    // Recalcular summary (simplificado)
    const updated = fees.map(f => f.id === id ? { ...f, paid: true } : f);
    setFees(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Financeiro</h1>

      {/* Dashboard de resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Receitas (Honorários)</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {summary.total_receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Despesas (Custas + Taxas)</p>
            <p className="text-2xl font-bold text-red-500">
              R$ {summary.total_despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              R$ {summary.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de registros */}
      <div className="flex flex-col gap-3">
        {fees.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro financeiro.</p>
        )}
        {fees.map(fee => (
          <Card key={fee.id}>
            <CardContent className="py-3 px-4 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{TYPE_LABELS[fee.type] || fee.type}</span>
                  <span className="text-sm font-medium">{fee.description}</span>
                  {fee.paid && <Badge variant="secondary" className="text-[10px]">Pago</Badge>}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {fee.process && <span>📋 {fee.process.case_id}</span>}
                  {fee.due_date && <span>📅 {new Date(fee.due_date).toLocaleDateString('pt-BR')}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono font-bold ${fee.type === 'HONORARIO' ? 'text-green-600' : 'text-red-500'}`}>
                  {fee.type === 'HONORARIO' ? '+' : '-'} R$ {parseFloat(fee.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {!fee.paid && (
                  <Button size="sm" variant="outline" onClick={() => handlePay(fee.id)}>
                    Marcar Pago
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
