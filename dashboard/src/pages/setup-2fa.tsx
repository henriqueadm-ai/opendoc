import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Setup2FAPage() {
  const navigate = useNavigate();
  const [otpauthUri, setOtpauthUri] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'generate' | 'confirm'>('generate');

  const handleGenerateSecret = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/2fa/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpauthUri(data.data.otpauth);
      setStep('confirm');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/2fa/confirm', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
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
          <CardTitle className="text-2xl font-bold tracking-tight">Configurar 2FA</CardTitle>
          <CardDescription>
            {step === 'generate'
              ? 'A autenticação em dois fatores é obrigatória para acessar o OpenDoc.'
              : 'Escaneie o QR code com seu app autenticador e insira o código.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'generate' ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Você precisará de um aplicativo autenticador como Google Authenticator, 
                Authy ou 1Password.
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleGenerateSecret} disabled={loading} className="w-full">
                {loading ? 'Gerando...' : 'Gerar Código QR'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleConfirm} className="flex flex-col gap-4">
              {/* QR Code - renderizado como URI text (em produção seria uma imagem QR real) */}
              <div className="p-4 bg-muted rounded-lg break-all">
                <p className="text-xs text-muted-foreground mb-1">URI para o autenticador:</p>
                <code className="text-xs">{otpauthUri}</code>
              </div>
              <Input
                id="totp-confirm"
                type="text"
                placeholder="Código de 6 dígitos"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                autoFocus
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Confirmando...' : 'Confirmar e Ativar'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
