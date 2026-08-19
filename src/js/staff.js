// Rendering pentagramma condiviso: una chiave, N note separate da stanghette di battuta
import { NOTE_Y, LEDGER_NOTES } from './notes.js';

const HEAD_W = 13;
const HEAD_H = 10;
const STAFF_COLOR = '#234EA0';
const LINE_W = 1.5;
const BAR_W  = 2;
const CLEF_W = 72;   // area riservata alla chiave di violino
const PAD_L  = 12;
const PAD_R  = 12;

// Posizioni Y delle 5 righe in NOTE_Y space (positivo = giù sul canvas)
// Derivate dai valori NOTE_Y delle note che cadono sulle righe
const LINE_OFFSETS = [42, 20, 0, -20, -40];

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
  const staffSpan = LINE_OFFSETS[0] - LINE_OFFSETS[LINE_OFFSETS.length - 1]; // 82px
  const clefH = staffSpan + 42;
  const clefW = clefH * 0.38;
  const cy = h / 2;
  const top = cy + LINE_OFFSETS[0] - staffSpan * 0.55;
  ctx.drawImage(clefImg, PAD_L + 2, top, clefW, clefH);
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

  for (let i = 0; i < playerCount; i++) {
    const sectionStart = PAD_L + CLEF_W + i * sectionW;

    // Stanghetta di battuta al termine di ogni sezione
    drawBarline(ctx, sectionStart + sectionW, h);

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
}

// Ridisegna senza note (joker attivo): righe + chiave + stanghette, note oscurate
export function drawStaffCovered(canvas, playerCount) {
  drawStaff(canvas, [], playerCount);
}
