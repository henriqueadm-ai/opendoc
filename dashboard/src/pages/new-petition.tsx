import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/store/useAuthStore';
import { usePipelineStore } from '@/store/usePipelineStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PETITION_TYPES = [
  { value: 'INICIAL', label: 'Petição Inicial' },
  { value: 'CONTESTACAO', label: 'Contestação' },
  { value: 'IMPUGNACAO', label: 'Impugnação' },
  { value: 'RECURSO', label: 'Recurso' },
  { value: 'MANIFESTACAO', label: 'Manifestação' },
  { value: 'OUTRO', label: 'Outro' },
];

export function NewPetitionPage() {
  const navigate = useNavigate();
  const setActiveProcess = usePipelineStore((s) => s.setActiveProcess);

  const [type, setType] = useState('INICIAL');
  const [brief, setBrief] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.trim()) {
      setError('O brief jurídico é obrigatório');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // 1. Criar processo
      const createRes = await apiFetch('/api/processes', {
        method: 'POST',
        body: JSON.stringify({ type, brief }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error);
      const processId = createData.data.id;

      // 2. Upload docs (se houver)
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));

        const uploadRes = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/processes/${processId}/upload`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${import.meta.env.VITE_API_URL ? '' : ''}` },
            body: formData,
          }
        );
        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          throw new Error(uploadErr.error || 'Erro no upload');
        }
      }

      // 3. Disparar pipeline
      const pipelineRes = await apiFetch(`/api/processes/${processId}/pipeline/start`, {
        method: 'POST',
      });
      if (!pipelineRes.ok) {
        const pipelineErr = await pipelineRes.json();
        throw new Error(pipelineErr.error || 'Erro ao iniciar pipeline');
      }

      // 4. Navegar para a view do pipeline
      setActiveProcess(processId);
      navigate('/pipeline');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nova Petição</CardTitle>
          <CardDescription>
            Selecione o tipo, descreva a tese e envie os documentos do caso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Tipo de petição */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tipo de Petição</label>
              <div className="flex flex-wrap gap-2">
                {PETITION_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => setType(pt.value)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      type === pt.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brief jurídico */}
            <div className="flex flex-col gap-2">
              <label htmlFor="brief" className="text-sm font-medium">Brief Jurídico</label>
              <Textarea
                id="brief"
                placeholder="Descreva a tese jurídica, os fatos relevantes e o que deseja na petição..."
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={5}
                required
              />
            </div>

            {/* Upload de documentos */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Documentos do Caso
                <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
              </label>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp3,.wav"
                onChange={handleFileSelect}
              />
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {files.map((f, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => removeFile(i)}
                    >
                      {f.name} ({(f.size / 1024).toFixed(0)} KB) ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Criando processo e iniciando pipeline...' : 'Criar Petição e Iniciar Pipeline'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
