// Rendering del pentagramma su Canvas per un singolo giocatore
import { NOTE_Y, ON_LINE, LEDGER_NOTES } from './notes.js';

const L = 18;          // interlinea in px (versione orizzontale)
const HEAD_W = 14;     // larghezza testa nota
const HEAD_H = 11;     // altezza testa nota
const STAFF_COLOR = '#234EA0';
const LINE_W = 1.5;

// centerY = pixel Y del centro del canvas (= posizione SI)
function staffCenterY(canvas) {
  return canvas.height / 2;
}

// Disegna le 5 righe del pentagramma
function drawLines(ctx, canvas) {
  const cx = canvas.width;
  const cy = staffCenterY(canvas);
  ctx.strokeStyle = STAFF_COLOR;
  ctx.lineWidth = LINE_W;
  for (let i = -2; i <= 2; i++) {
    const y = cy + i * L * 2;  // linee ogni 2L (linea = L*2, spazio = L*2)
    // rigo: linea 1 = +4L, linea 2 = +2L, linea 3 = 0, linea 4 = -2L, linea 5 = -4L
    // ma NOTE_Y usa L come semilinea: NOTE_Y['SI']=0, NOTE_Y['SOL']=20=L, NOTE_Y['MI(b)']=42=~2.3L
    // Ricalcolo: righi ogni 2 semitoni = step di 10-11px
    ctx.beginPath();
    ctx.moveTo(10, y);
    ctx.lineTo(cx - 10, y);
    ctx.stroke();
  }
}

// Coordinate Y reali sul canvas per una nota
function noteCanvasY(canvas, noteId) {
  const cy = staffCenterY(canvas);
  return cy - NOTE_Y[noteId];
}

// Disegna linee supplementari se necessarie
function drawLedgerLines(ctx, canvas, noteId, noteX) {
  const extras = LEDGER_NOTES[noteId];
  if (!extras || extras.length === 0) return;
  const cy = staffCenterY(canvas);
  ctx.strokeStyle = STAFF_COLOR;
  ctx.lineWidth = LINE_W;
  extras.forEach(offset => {
    const y = cy - offset;
    ctx.beginPath();
    ctx.moveTo(noteX - HEAD_W - 4, y);
    ctx.lineTo(noteX + HEAD_W + 4, y);
    ctx.stroke();
  });
}

// Testa di nota (ellisse nera piena)
function drawNoteHead(ctx, x, y) {
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x, y, HEAD_W / 2, HEAD_H / 2, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

export function drawStaff(canvas, noteId) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLines(ctx, canvas);

  if (!noteId) return;

  const noteX = canvas.width * 0.62;
  const noteY = noteCanvasY(canvas, noteId);
  drawLedgerLines(ctx, canvas, noteId, noteX);
  drawNoteHead(ctx, noteX, noteY);
}

// Ridisegna con nota oscurata (joker)
export function drawStaffCovered(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLines(ctx, canvas);
}
