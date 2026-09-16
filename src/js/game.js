import { DIFFICULTY_SETS, ANSWER_ORDER_IT, ANSWER_ORDER_EN, NOTE_TO_BAR_IT, NOTE_TO_BAR_EN } from './notes.js';
import { drawStaff, drawStaffCovered } from './staff.js';

const TOTAL_ROUNDS = 5;
const TIMER_MS = 3500;
const NOTE_CREATOR_MS = 2000;

let cfg;          // { players, difficulty, timer, lang }
let scores;       // [0, 0, 0, 0]
let round;        // 1–5
let notes;        // nota assegnata per player (array)
let answers;      // risposta corrente per player ('q' o nome nota)
let timerHandle;
let noteCreatorHandle;
let bound = false;

// --- Entry point ---
export function startGame(state, onHome) {
  cfg = state;
  scores = [0, 0, 0, 0];
  round = 0;
  document.getElementById('home-screen').hidden = true;
  document.getElementById('game-screen').hidden = false;
  renderScores();
  renderPlayerVisibility();
  if (!bound) { bindGame(onHome); bound = true; }
  startRound();
}

// --- Round ---
function startRound() {
  round++;
  notes = drawNotes();
  answers = Array(cfg.players).fill('q');

  const canvas = document.getElementById('staff-canvas');
  drawStaff(canvas, [], cfg.players);

  for (let i = 0; i < cfg.players; i++) {
    setAnswerBar(i, 'q');
    document.getElementById(`answer-bar-${i + 1}`).hidden = true;
  }

  document.getElementById('btn-go').hidden = false;
  document.getElementById('btn-reveal').hidden = true;
  document.getElementById('note-creator').hidden = true;
  document.getElementById('spot-cover').hidden = true;

  updateRoundDisplay();
}

// Prima nota casuale; ogni nota successiva ≠ dalla precedente
function drawNotes() {
  const pool = DIFFICULTY_SETS[cfg.difficulty];
  const result = [];
  for (let i = 0; i < cfg.players; i++) {
    const prev = result[i - 1];
    const available = pool.length > 1 ? pool.filter(n => n !== prev) : pool;
    result.push(available[Math.floor(Math.random() * available.length)]);
  }
  return result;
}

// --- GO! ---
function onGo() {
  document.getElementById('btn-go').hidden = true;
  document.getElementById('note-creator').hidden = false;
  drawStaff(document.getElementById('staff-canvas'), notes, cfg.players);

  noteCreatorHandle = setTimeout(() => {
    document.getElementById('note-creator').hidden = true;
  }, NOTE_CREATOR_MS);

  for (let i = 0; i < cfg.players; i++) {
    document.getElementById(`answer-bar-${i + 1}`).hidden = false;
  }

  if (cfg.timer) {
    timerHandle = setTimeout(() => {
      document.getElementById('spot-cover').hidden = false;
      const canvas = document.getElementById('staff-canvas');
      drawStaffCovered(canvas, cfg.players);
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
  clearTimeout(noteCreatorHandle);
  document.getElementById('spot-cover').hidden = true;
  document.getElementById('btn-reveal').hidden = true;
  document.getElementById('note-creator').hidden = true;

  // Ridisegna il pentagramma con le note (in caso fossero coperte)
  const canvas = document.getElementById('staff-canvas');
  drawStaff(canvas, notes, cfg.players);

  for (let i = 0; i < cfg.players; i++) {
    const correctKey = cfg.lang === 'it' ? NOTE_TO_BAR_IT[notes[i]] : NOTE_TO_BAR_EN[notes[i]];
    setAnswerBar(i, correctKey);
    const bar = document.getElementById(`answer-bar-${i + 1}`);
    if (answers[i] === correctKey) {
      scores[i] = Math.min(5, scores[i] + 1);
      flashScore(i);
      bar.classList.add('answer-correct');
    } else {
      bar.classList.add('answer-wrong');
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
  const pl  = playerIdx + 1;
  const img = document.getElementById(`answer-bar-${pl}`);
  img.src = `barra_risposta_${cfg.lang}_${noteKey}_pl${pl}.png`;
}

function renderScores() {
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`score-${i + 1}`);
    el.hidden = false;
    el.src = `pl${i + 1}-score-${i < cfg.players ? scores[i] : 0}.png`;
  }
}

function flashScore(playerIdx) {
  const el = document.getElementById(`score-anim-${playerIdx + 1}`);
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 800);
}

function hideAnswerBars() {
  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(`answer-bar-${i}`);
    bar.hidden = true;
    bar.classList.remove('answer-correct', 'answer-wrong');
  }
}

function renderPlayerVisibility() {
  for (let i = 1; i <= 4; i++) {
    const active = i <= cfg.players;
    const controls = document.getElementById(`player-controls-${i}`);
    controls.hidden = false;
    controls.classList.toggle('player-inactive', !active);
    document.getElementById(`btn-plus-${i}`).hidden = !active;
    document.getElementById(`btn-minus-${i}`).hidden = !active;
  }
}

function updateRoundDisplay() {
  document.getElementById('round-display').textContent = `${round} / ${TOTAL_ROUNDS}`;
}

// --- Binding eventi (eseguito una sola volta) ---
function bindGame(onHome) {
  document.getElementById('btn-go').addEventListener('click', onGo);
  document.getElementById('btn-reveal').addEventListener('click', onReveal);
  document.getElementById('btn-home').addEventListener('click', () => {
    clearTimeout(timerHandle);
    clearTimeout(noteCreatorHandle);
    document.getElementById('game-screen').hidden = true;
    document.getElementById('home-screen').hidden = false;
    for (let i = 1; i <= 4; i++) {
      document.getElementById(`winner-icon-${i}`).hidden = true;
    }
    bound = false;
    onHome();
  });

  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(`answer-bar-${i}`);
    bar.addEventListener('click', e => {
      if (!document.getElementById('btn-reveal').hidden) return;
      // La barra è un overlay 1280px: la zona reale inizia a ~x=987, centro ~1134
      const dir = e.offsetX > bar.offsetWidth * (1134 / 1280) ? 1 : -1;
      cycleAnswer(i - 1, dir);
    });
  }

  for (let i = 1; i <= 4; i++) {
    document.getElementById(`btn-plus-${i}`)
      .addEventListener('click', () => adjustScore(i - 1, 1));
    document.getElementById(`btn-minus-${i}`)
      .addEventListener('click', () => adjustScore(i - 1, -1));
  }
}
