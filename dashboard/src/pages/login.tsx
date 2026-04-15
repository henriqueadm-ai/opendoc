import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, apiFetch } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginPage() {
  const navigate = useNavigate();
  const { setPending2FA, setCredentials, pendingUserId } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPending2FA(data.data.userId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({ userId: pendingUserId, code: totpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCredentials(data.data.access_token, data.data.refresh_token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">OpenDoc</CardTitle>
          <CardDescription>
            {pendingUserId
              ? 'Insira o código do seu aplicativo autenticador'
              : 'Entre com suas credenciais'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingUserId ? (
            <form onSubmit={handleStep1} className="flex flex-col gap-4">
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStep2} className="flex flex-col gap-4">
              <Input
                id="totp"
                type="text"
                placeholder="Código 2FA (6 dígitos)"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                required
                maxLength={6}
                autoFocus
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Verificando...' : 'Verificar'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setPending2FA(0)}>
                Voltar
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
