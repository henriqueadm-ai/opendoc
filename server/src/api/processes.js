import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { enqueuePipelineJob } from '../queue/pipeline.queue.js';

// O multer vai usar memory storage para preservar o requisito de Zero Persistência Bruta
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

const router = Router();

// FR1: Criar nova requisição
router.post('/', async (req, res) => {
  try {
    const { type, brief } = req.body;
    
    // WIP: Aqui criaríamos no DB real.
    // req.prisma... Process.create()
    const case_id = `ID_${Date.now()}`;

    res.status(201).json({
      success: true,
      data: {
        id: 1, // dummy
        case_id,
        type,
        brief,
        status: 'DRAFT',
      }
    });
  } catch (error) {
    console.error('[Processes API] Erro ao criar processo', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// FR3: Upload de múltiplos documentos
router.post('/:id/upload', upload.array('files', 20), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' });
    }

    // Processa de forma efêmera e insere na DB pra linkar as referências (o conteúdo não vai para disk persistente)
    // Extraímos meta-dados
    const uploadedDocs = files.map(file => ({
      filename: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
      storage_mode: 'EPHEMERAL_RAM'
    }));

    res.json({
      success: true,
      message: `${files.length} arquivos recebidos e extraídos na RAM.`,
      data: uploadedDocs
    });
  } catch (error) {
    console.error('[Processes API] Erro ao processar upload', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Start Pipeline
router.post('/:id/pipeline/start', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Inicia o pipeline
    await enqueuePipelineJob(id);

    res.json({
      success: true,
      message: 'Pipeline enfileirado com sucesso'
    });
  } catch (error) {
    console.error('[Processes API] Erro ao iniciar pipeline', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
