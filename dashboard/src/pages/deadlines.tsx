import { useState, useEffect } from 'react';
import { apiFetch } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Deadline {
  id: number;
  process_id: number;
  title: string;
  description: string | null;
  due_date: string;
  priority: string;
  status: string;
  process?: { id: number; case_id: string; type: string };
}

const PRIORITY_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  LOW: 'outline',
  NORMAL: 'secondary',
  HIGH: 'default',
  URGENT: 'destructive',
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue'>('all');

  useEffect(() => {
    apiFetch('/api/deadlines')
      .then(r => r.json())
      .then(d => setDeadlines(d.data || []));
  }, []);

  const filtered = deadlines.filter(d => {
    if (filter === 'upcoming') return d.status === 'PENDING' && daysUntil(d.due_date) <= 7 && daysUntil(d.due_date) >= 0;
    if (filter === 'overdue') return d.status === 'OVERDUE' || (d.status === 'PENDING' && daysUntil(d.due_date) < 0);
    return true;
  });

  const handleComplete = async (id: number) => {
    await apiFetch(`/api/deadlines/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    setDeadlines(prev => prev.map(d => d.id === id ? { ...d, status: 'COMPLETED' } : d));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Prazos Processuais</h1>
        <div className="flex gap-2">
          {(['all', 'upcoming', 'overdue'] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todos' : f === 'upcoming' ? 'Próx. 7 dias' : 'Vencidos'}
            </Button>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{deadlines.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-amber-500">
            {deadlines.filter(d => d.status === 'PENDING').length}
          </p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Vencidos</p>
          <p className="text-2xl font-bold text-destructive">
            {deadlines.filter(d => d.status === 'PENDING' && daysUntil(d.due_date) < 0).length}
          </p>
        </CardContent></Card>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum prazo encontrado.</p>
        )}
        {filtered.map(d => {
          const days = daysUntil(d.due_date);
          const isOverdue = d.status === 'PENDING' && days < 0;
          return (
            <Card key={d.id} className={isOverdue ? 'border-destructive' : ''}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${d.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                      {d.title}
                    </span>
                    <Badge variant={PRIORITY_COLORS[d.priority]} className="text-[10px]">{d.priority}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {d.process && <span>📋 {d.process.case_id}</span>}
                    <span>📅 {new Date(d.due_date).toLocaleDateString('pt-BR')}</span>
                    <span className={isOverdue ? 'text-destructive font-medium' : days <= 2 ? 'text-amber-500' : ''}>
                      {d.status === 'COMPLETED' ? '✓ Concluído'
                        : isOverdue ? `⚠ ${Math.abs(days)} dia(s) atrasado`
                        : days === 0 ? '🔴 Vence hoje'
                        : `${days} dia(s) restantes`}
                    </span>
                  </div>
                </div>
                {d.status === 'PENDING' && (
                  <Button size="sm" variant="outline" onClick={() => handleComplete(d.id)}>
                    ✓ Concluir
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
