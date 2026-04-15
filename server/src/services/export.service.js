import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Gera um PDF visual law do rascunho final.
 * Retorna o buffer do PDF em Uint8Array.
 *
 * @param {{ title: string, caseId: string, body: string, disclaimer: string }} opts
 * @returns {Promise<Uint8Array>}
 */
export async function generatePdf({ title, caseId, body, disclaimer }) {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold  = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const WIDTH  = 595.28; // A4 width in points
  const HEIGHT = 841.89;
  const MARGIN = 72; // 1 inch
  const LINE_H = 16;

  let page = pdfDoc.addPage([WIDTH, HEIGHT]);
  let y = HEIGHT - MARGIN;

  // Helper: quebrar texto em linhas dentro da largura disponível
  function wrapText(text, font, size, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function drawText(text, font, size, color = rgb(0, 0, 0)) {
    const maxWidth = WIDTH - MARGIN * 2;
    const lines = wrapText(text, font, size, maxWidth);
    for (const line of lines) {
      if (y < MARGIN + LINE_H * 2) {
        page = pdfDoc.addPage([WIDTH, HEIGHT]);
        y = HEIGHT - MARGIN;
      }
      page.drawText(line, { x: MARGIN, y, size, font, color });
      y -= LINE_H;
    }
    y -= 4; // espaço extra após bloco
  }

  // ── Cabeçalho ────────────────────────────────────────
  page.drawRectangle({ x: 0, y: HEIGHT - 80, width: WIDTH, height: 80, color: rgb(0.31, 0.27, 0.9) });
  page.drawText('OpenDoc', { x: MARGIN, y: HEIGHT - 48, size: 22, font: timesBold, color: rgb(1, 1, 1) });
  page.drawText(`Processo: ${caseId}`, { x: MARGIN, y: HEIGHT - 68, size: 10, font: timesRoman, color: rgb(0.85, 0.85, 1) });
  y = HEIGHT - MARGIN - 30;

  // ── Título ────────────────────────────────────────────
  drawText(title.toUpperCase(), timesBold, 14);
  y -= 8;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: WIDTH - MARGIN, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
  y -= 16;

  // ── Corpo ─────────────────────────────────────────────
  const paragraphs = body.split('\n\n');
  for (const para of paragraphs) {
    drawText(para.trim(), timesRoman, 11);
    y -= 6;
  }

  // ── Disclaimer ────────────────────────────────────────
  y -= 24;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: WIDTH - MARGIN, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  y -= 14;
  drawText(disclaimer, timesRoman, 8, rgb(0.5, 0.5, 0.5));

  return pdfDoc.save();
}

/**
 * Rota Express para exportar PDF de um processo.
 * Usar diretamente: router.get('/:id/export/pdf', exportPdfHandler)
 */
export async function exportPdfHandler(req, res) {
  try {
    const processId = parseInt(req.params.id);
    const process = await req.tenantPrisma.process.findUnique({
      where: { id: processId },
      select: { case_id: true, type: true, brief: true, status: true },
    });
    if (!process) return res.status(404).json({ error: 'Process not found' });

    // Recuperar o rascunho final (último diff ACCEPTED ou o brief)
    const lastAccepted = await req.tenantPrisma.discussion.findFirst({
      where: { process_id: processId, sender: 'AI', diff_status: 'ACCEPTED' },
      orderBy: { created_at: 'desc' },
    });

    const body = lastAccepted?.diff_new || process.brief || '[Rascunho não disponível]';
    const disclaimer = 'Este documento foi gerado com auxílio de inteligência artificial e deve ser obrigatoriamente revisado por advogado(a) habilitado(a) na OAB antes de qualquer utilização processual.';

    const pdfBytes = await generatePdf({
      title: `${process.type} – ${process.case_id}`,
      caseId: process.case_id,
      body,
      disclaimer,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="peticao-${process.case_id}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
