// Rendering pentagramma condiviso: una chiave, N note separate da stanghette di battuta
import { NOTE_Y, LEDGER_NOTES } from './notes.js';

const HEAD_W = 36;
const HEAD_H = 26;
const STAFF_COLOR = '#234EA0';
const LINE_W = 2;
const BAR_W  = 3;
const CLEF_W = 108;  // area riservata alla chiave di violino
const PAD_L  = 16;
const PAD_R  = 16;

// Posizioni Y delle 5 righe (scalate ×1.5 rispetto all'originale, step 30px)
const LINE_OFFSETS = [63, 30, 0, -30, -60];

const clefImg = new Image();
clefImg.src = 'chiave-violino.svg';

// Converte NOTE_Y → pixel Y sul canvas (positivo = in basso)
function toCanvasY(cy, noteId) {
  return cy + NOTE_Y[noteId];
}

function drawLines(ctx, w, h) {
  const cy = h / 2;
  ctx.strokeStyle = STAFF_COLOR;
  ctx.lineWidth = LINE_W;
  for (const off of LINE_OFFSETS) {
    const y = cy + off;
    ctx.beginPath();
    ctx.moveTo(PAD_L, y);
    ctx.lineTo(w - PAD_R, y);
    ctx.stroke();
  }
}

function drawClef(ctx, h) {
  if (!clefImg.complete || clefImg.naturalWidth === 0) return;

  // Il SVG ha viewBox 1920×1152 ma la chiave occupa solo x=94-287, y=344-805
  // Usiamo drawImage a 9 argomenti per ritagliare quella regione
  const vbW = 1920, vbH = 1152;
  const imgW = clefImg.naturalWidth, imgH = clefImg.naturalHeight;
  const sx = (94  / vbW) * imgW;
  const sy = (344 / vbH) * imgH;
  const sw = (193 / vbW) * imgW;   // 287-94
  const sh = (461 / vbH) * imgH;   // 805-344

  const cy = h / 2;
  const step = LINE_OFFSETS[1] - LINE_OFFSETS[2]; // 30px
  const staffTop    = cy + LINE_OFFSETS[LINE_OFFSETS.length - 1]; // cy - 60
  const staffBottom = cy + LINE_OFFSETS[0];                       // cy + 63

  // La chiave si estende 2 step sopra la linea 5 e 1 step sotto la linea 1
  const clefTop    = staffTop - 2 * step;      // cy - 120
  const clefBottom = staffBottom + step;        // cy + 93
  const clefH = clefBottom - clefTop;           // ~213px
  const clefW = clefH * (193 / 461);            // mantieni aspect ratio

  ctx.drawImage(clefImg, sx, sy, sw, sh, PAD_L + 2, clefTop, clefW, clefH);
}

function drawBarline(ctx, x, h) {
  const cy = h / 2;
  const top    = cy + LINE_OFFSETS[0];
  const bottom = cy + LINE_OFFSETS[LINE_OFFSETS.length - 1];
  ctx.strokeStyle = STAFF_COLOR;
  ctx.lineWidth = BAR_W;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.stroke();
}

function drawLedgerLines(ctx, cy, noteId, noteX) {
  const extras = LEDGER_NOTES[noteId];
  if (!extras || extras.length === 0) return;
  ctx.strokeStyle = STAFF_COLOR;
  ctx.lineWidth = LINE_W;
  for (const off of extras) {
    const y = cy + off;
    ctx.beginPath();
    ctx.moveTo(noteX - HEAD_W - 5, y);
    ctx.lineTo(noteX + HEAD_W + 5, y);
    ctx.stroke();
  }
}

function drawNoteHead(ctx, x, y) {
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x, y, HEAD_W / 2, HEAD_H / 2, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

// notesArray: array di noteId, uno per player attivo (lunghezza = playerCount)
// Stanghetta di battuta separa ogni sezione; stanghetta finale chiude il rigo
export function drawStaff(canvas, notesArray, playerCount) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cy = h / 2;

  ctx.clearRect(0, 0, w, h);
  drawLines(ctx, w, h);
  drawClef(ctx, h);

  const usableW  = w - PAD_L - CLEF_W - PAD_R;
  const sectionW = usableW / playerCount;

  const staffTopY = cy + LINE_OFFSETS[LINE_OFFSETS.length - 1]; // cy - 60

  for (let i = 0; i < playerCount; i++) {
    const sectionStart = PAD_L + CLEF_W + i * sectionW;

    // Stanghetta di battuta al termine di ogni sezione
    drawBarline(ctx, sectionStart + sectionW, h);

    // Numero giocatore sopra ogni sezione (stile graffiti)
    const numX = sectionStart + sectionW * 0.5;
    const numY = staffTopY - 52;
    ctx.font = '58px "Black Ops One", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.strokeText(String(i + 1), numX, numY);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillText(String(i + 1), numX, numY);

    if (notesArray && notesArray[i] != null) {
      const noteX = sectionStart + sectionW * 0.52;
      const noteY = toCanvasY(cy, notesArray[i]);
      drawLedgerLines(ctx, cy, notesArray[i], noteX);
      drawNoteHead(ctx, noteX, noteY);
    }
  }

  // Se la chiave non era ancora pronta, ridisegna al caricamento
  if (!clefImg.complete) {
    clefImg.onload = () => drawStaff(canvas, notesArray, playerCount);
  }

  // Se "Black Ops One" non è ancora caricato, ridisegna quando pronto
  if (document.fonts && !document.fonts.check('58px "Black Ops One"')) {
    document.fonts.load('58px "Black Ops One"').then(() => {
      drawStaff(canvas, notesArray, playerCount);
    }).catch(() => {});
  }
}

// Ridisegna senza note (joker attivo): righe + chiave + stanghette, note oscurate
export function drawStaffCovered(canvas, playerCount) {
  drawStaff(canvas, [], playerCount);
}

// Restituisce le coordinate X (canvas-relative) del centro nota per ogni player
export function getNoteCenters(canvasWidth, playerCount) {
  const usableW = canvasWidth - PAD_L - CLEF_W - PAD_R;
  const sectionW = usableW / playerCount;
  return Array.from({ length: playerCount }, (_, i) =>
    PAD_L + CLEF_W + i * sectionW + sectionW * 0.52
  );
}
