import { DIFFICULTY_SETS, ANSWER_ORDER_IT, ANSWER_ORDER_EN, NOTE_TO_BAR_IT, NOTE_TO_BAR_EN } from './notes.js';
import { drawStaff, drawStaffCovered } from './staff.js';

const TOTAL_ROUNDS = 5;
const TIMER_MS = 3500;

let cfg;           // { players, difficulty, timer, lang }
let scores;        // [0, 0, 0, 0]
let round;         // 1–5
let notes;         // nota assegnata per player (array)
let answers;       // risposta corrente per player ('q' o nome nota)
let timerHandle;

// --- Entry point ---
export function startGame(state, onHome) {
  cfg = state;
  scores = [0, 0, 0, 0];
  round = 0;
  document.getElementById('home-screen').hidden = true;
  document.getElementById('game-screen').hidden = false;
  renderScores();
  renderPlayerVisibility();
  bindGame(onHome);
  startRound();
}

// --- Round ---
function startRound() {
  round++;
  notes = drawNotes();
  answers = Array(cfg.players).fill('q');

  for (let i = 0; i < cfg.players; i++) {
    const canvas = document.getElementById(`staff-canvas-${i + 1}`);
    drawStaff(canvas, notes[i]);
    setAnswerBar(i, 'q');
  }

  document.getElementById('btn-go').hidden = false;
  document.getElementById('btn-reveal').hidden = true;
  document.getElementById('note-creator').hidden = true;
  document.getElementById('spot-cover').hidden = true;

  updateRoundDisplay();
}

// Sorteggia una nota diversa per ogni giocatore
function drawNotes() {
  const pool = [...DIFFICULTY_SETS[cfg.difficulty]];
  const result = [];
  for (let i = 0; i < cfg.players; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// --- GO! ---
function onGo() {
  document.getElementById('btn-go').hidden = true;
  document.getElementById('note-creator').hidden = false;

  // Mostra le barre risposta
  for (let i = 0; i < cfg.players; i++) {
    document.getElementById(`answer-bar-${i + 1}`).hidden = false;
  }

  if (cfg.timer) {
    timerHandle = setTimeout(() => {
      document.getElementById('spot-cover').hidden = false;
      // Copre le note sul canvas
      for (let i = 0; i < cfg.players; i++) {
        const canvas = document.getElementById(`staff-canvas-${i + 1}`);
        drawStaffCovered(canvas);
      }
    }, TIMER_MS);
  }
}

// --- Gestione risposta ---
function cycleAnswer(playerIdx, direction) {
  const order = cfg.lang === 'it' ? ANSWER_ORDER_IT : ANSWER_ORDER_EN;
  const current = answers[playerIdx];

  let nextIdx;
  if (current === 'q') {
    nextIdx = direction > 0 ? 0 : order.length - 1;
  } else {
    const idx = order.indexOf(current);
    nextIdx = (idx + direction + order.length) % order.length;
  }

  answers[playerIdx] = order[nextIdx];
  setAnswerBar(playerIdx, answers[playerIdx]);
  checkAllAnswered();
}

function checkAllAnswered() {
  const allAnswered = answers.slice(0, cfg.players).every(a => a !== 'q');
  document.getElementById('btn-reveal').hidden = !allAnswered;
}

// --- REVEAL ---
function onReveal() {
  clearTimeout(timerHandle);
  document.getElementById('spot-cover').hidden = true;
  document.getElementById('btn-reveal').hidden = true;
  document.getElementById('note-creator').hidden = true;

  // Mostra la nota corretta su ogni pentagramma
  for (let i = 0; i < cfg.players; i++) {
    const canvas = document.getElementById(`staff-canvas-${i + 1}`);
    drawStaff(canvas, notes[i]);

    // Ruota la barra alla risposta corretta
    const correctKey = cfg.lang === 'it' ? NOTE_TO_BAR_IT[notes[i]] : NOTE_TO_BAR_EN[notes[i]];
    setAnswerBar(i, correctKey);

    // Punto se risposta corretta
    const playerAnswer = answers[i];
    if (playerAnswer === correctKey) {
      scores[i] = Math.min(5, scores[i] + 1);
      flashScore(i);
    }
  }

  setTimeout(() => {
    renderScores();
    hideAnswerBars();
    if (round >= TOTAL_ROUNDS) {
      endGame();
    } else {
      setTimeout(startRound, 1200);
    }
  }, 1800);
}

// --- Fine partita ---
function endGame() {
  const maxScore = Math.max(...scores.slice(0, cfg.players));
  for (let i = 0; i < cfg.players; i++) {
    if (scores[i] === maxScore) {
      document.getElementById(`winner-icon-${i + 1}`).hidden = false;
    }
  }
  document.getElementById('btn-go').hidden = true;
}

// --- Punteggio manuale (±) ---
function adjustScore(playerIdx, delta) {
  scores[playerIdx] = Math.max(0, Math.min(5, scores[playerIdx] + delta));
  renderScores();
}

// --- Render helpers ---
function setAnswerBar(playerIdx, noteKey) {
  const lang = cfg.lang;
  const pl = playerIdx + 1;
  const img = document.getElementById(`answer-bar-${pl}`);
  img.src = `barra_risposta_${lang}_${noteKey}_pl${pl}.png`;
}

function renderScores() {
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`score-${i + 1}`);
    const visible = i < cfg.players;
    el.hidden = !visible;
    if (visible) el.src = `pl${i + 1}-score-${scores[i]}.png`;
  }
}

function flashScore(playerIdx) {
  const el = document.getElementById(`score-anim-${playerIdx + 1}`);
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 800);
}

function hideAnswerBars() {
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`answer-bar-${i}`).hidden = true;
  }
}

function renderPlayerVisibility() {
  for (let i = 1; i <= 4; i++) {
    const visible = i <= cfg.players;
    document.getElementById(`player-slot-${i}`).hidden = !visible;
  }
}

function updateRoundDisplay() {
  document.getElementById('round-display').textContent = `${round} / ${TOTAL_ROUNDS}`;
}

// --- Binding eventi ---
function bindGame(onHome) {
  document.getElementById('btn-go').addEventListener('click', onGo);
  document.getElementById('btn-reveal').addEventListener('click', onReveal);
  document.getElementById('btn-home').addEventListener('click', () => {
    clearTimeout(timerHandle);
    document.getElementById('game-screen').hidden = true;
    document.getElementById('home-screen').hidden = false;
    // Reset winner icons
    for (let i = 1; i <= 4; i++) {
      document.getElementById(`winner-icon-${i}`).hidden = true;
    }
    onHome();
  });

  // Barre risposta: tap dx/sx per ogni giocatore
  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(`answer-bar-${i}`);
    bar.addEventListener('click', e => {
      if (document.getElementById('btn-reveal').hidden === false) return;
      const half = bar.offsetWidth / 2;
      const dir = e.offsetX > half ? 1 : -1;
      cycleAnswer(i - 1, dir);
    });
  }

  // Pulsanti ±
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`btn-plus-${i}`)
      .addEventListener('click', () => adjustScore(i - 1, 1));
    document.getElementById(`btn-minus-${i}`)
      .addEventListener('click', () => adjustScore(i - 1, -1));
  }
}
