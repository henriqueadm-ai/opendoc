import { useState, useEffect } from 'react';
import { apiFetch } from '@/store/useAuthStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ApiKey {
  id: number;
  provider: string;
  alias: string | null;
  masked_key: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

interface Branding {
  id: number;
  primary_color: string;
  logo_url: string | null;
  org_name: string;
  disclaimer_text: string;
}

const PROVIDERS = ['OPENAI', 'GOOGLE', 'ANTHROPIC', 'OPENROUTER', 'CUSTOM'];

// ─── Tab: Branding ────────────────────────────────────────────────────────────
function BrandingTab() {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    apiFetch('/api/settings/branding').then(r => r.json()).then(d => setBranding(d.data));
  }, []);

  const handleSave = async () => {
    if (!branding) return;
    setSaving(true);
    setMsg('');
    try {
      await apiFetch('/api/settings/branding', {
        method: 'PUT',
        body: JSON.stringify({
          primary_color: branding.primary_color,
          logo_url: branding.logo_url,
          org_name: branding.org_name,
          disclaimer_text: branding.disclaimer_text,
        }),
      });
      setMsg('Salvo com sucesso');
    } finally {
      setSaving(false);
    }
  };

  if (!branding) return <p className="text-sm text-muted-foreground p-4">Carregando...</p>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Nome da organização</label>
        <Input
          value={branding.org_name}
          onChange={e => setBranding({ ...branding, org_name: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">URL do Logotipo</label>
        <Input
          placeholder="https://..."
          value={branding.logo_url || ''}
          onChange={e => setBranding({ ...branding, logo_url: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Cor principal (hex)</label>
        <div className="flex gap-2 items-center">
          <Input
            type="color"
            className="w-14 h-10 p-1 cursor-pointer"
            value={branding.primary_color}
            onChange={e => setBranding({ ...branding, primary_color: e.target.value })}
          />
          <Input
            value={branding.primary_color}
            onChange={e => setBranding({ ...branding, primary_color: e.target.value })}
            className="font-mono"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Texto de Disclaimer Legal</label>
        <Textarea
          rows={3}
          value={branding.disclaimer_text}
          onChange={e => setBranding({ ...branding, disclaimer_text: e.target.value })}
        />
      </div>
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar Branding'}</Button>
    </div>
  );
}

// ─── Tab: Integrações LLM ─────────────────────────────────────────────────────
function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [provider, setProvider] = useState('OPENAI');
  const [alias, setAlias] = useState('');
  const [plaintext, setPlaintext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchKeys = async () => {
    const res = await apiFetch('/api/settings/api-keys');
    const d = await res.json();
    setKeys(d.data || []);
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/settings/api-keys', {
        method: 'POST',
        body: JSON.stringify({ provider, alias: alias || null, plaintext_key: plaintext }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setPlaintext('');
      setAlias('');
      await fetchKeys();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number, is_active: boolean) => {
    await apiFetch(`/api/settings/api-keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: !is_active }),
    });
    await fetchKeys();
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/settings/api-keys/${id}`, { method: 'DELETE' });
    await fetchKeys();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Form de adição */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Adicionar Chave de API</CardTitle>
          <CardDescription>A chave é criptografada com AES-256-GCM antes de ser persistida.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                placeholder="Apelido (ex: OpenAI Principal)"
                value={alias}
                onChange={e => setAlias(e.target.value)}
              />
            </div>
            <Input
              type="password"
              placeholder="Chave de API (sk-...)"
              value={plaintext}
              onChange={e => setPlaintext(e.target.value)}
              required
              className="font-mono"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} size="sm">
              {loading ? 'Salvando...' : '+ Adicionar Chave'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de chaves */}
      {keys.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">Nenhuma chave cadastrada.</p>
      )}
      {keys.map(k => (
        <div key={k.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Badge variant={k.is_active ? 'default' : 'secondary'}>{k.provider}</Badge>
              {k.alias && <span className="text-sm font-medium">{k.alias}</span>}
            </div>
            <code className="text-xs text-muted-foreground">{k.masked_key}</code>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => handleToggle(k.id, k.is_active)}>
              {k.is_active ? 'Desativar' : 'Ativar'}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(k.id)}>
              Remover
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Monitor de Gastos (stub visual) ─────────────────────────────────────
function UsageTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tokens Totais (mês)', value: '—', sub: 'sem dados' },
          { label: 'Custo Estimado', value: '—', sub: 'sem dados' },
          { label: 'Processos Concluídos', value: '—', sub: 'sem dados' },
        ].map(({ label, value, sub }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Monitor de gastos detalhado disponível na Epic 8 (Analytics).
      </p>
    </div>
  );
}

// ─── Page principal ────────────────────────────────────────────────────────────
export function AdminSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Configurações</h1>
      <Tabs defaultValue="branding">
        <TabsList className="mb-6">
          <TabsTrigger value="branding">Geral & Branding</TabsTrigger>
          <TabsTrigger value="apikeys">Integrações LLM</TabsTrigger>
          <TabsTrigger value="usage">Gastos & Uso</TabsTrigger>
        </TabsList>
        <TabsContent value="branding"><BrandingTab /></TabsContent>
        <TabsContent value="apikeys"><ApiKeysTab /></TabsContent>
        <TabsContent value="usage"><UsageTab /></TabsContent>
      </Tabs>
    </div>
  );
}
