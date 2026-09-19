import { DIFFICULTY_SETS, ANSWER_ORDER_IT, ANSWER_ORDER_EN, NOTE_TO_BAR_IT, NOTE_TO_BAR_EN } from './notes.js';
import { drawStaff, drawStaffCovered, getNoteCenters } from './staff.js';
import { playClick, playSpray } from './audio.js';

const TOTAL_ROUNDS = 5;
const TIMER_MS = 3500;
const TX_START = -900;
const TX_END = 850;
const ANIM_DURATION_MS = 2800;
const CANVAS_LEFT_IN_STAGE = 42.5;

let cfg;
let scores;
let round;
let notes;
let prevNotes; // note del round precedente, per evitare ripetizioni consecutive
let answers;
let phase = 'setup'; // 'setup' | 'answering' | 'revealed'
let timerHandle;
let animHandle = null;
let bound = false;

export function startGame(state, onHome) {
  cfg = state;
  scores = [0, 0, 0, 0];
  round = 0;
  prevNotes = [];
  document.getElementById('home-screen').hidden = true;
  document.getElementById('game-screen').hidden = false;
  document.getElementById('btn-home').hidden = true;
  renderScores();
  renderPlayerVisibility();
  if (!bound) { bindGame(onHome); bound = true; }
  startRound();
}

function startRound() {
  round++;
  phase = 'setup';
  prevNotes = notes ? [...notes] : [];
  notes = drawNotes();
  answers = Array(cfg.players).fill('q');

  const canvas = document.getElementById('staff-canvas');
  drawStaff(canvas, [], cfg.players);

  for (let i = 0; i < cfg.players; i++) {
    setAnswerBar(i, 'q');
    document.getElementById(`answer-bar-${i + 1}`).hidden = true;
  }

  document.getElementById('btn-go').hidden = false;
  const revealBtn = document.getElementById('btn-reveal');
  revealBtn.hidden = true;
  revealBtn.style.pointerEvents = 'none';
  stopNoteCreatorAnim();
  document.getElementById('spot-cover').hidden = true;

  updateRoundDisplay();
}

// Ogni giocatore riceve una nota diversa dagli altri e diversa dalla sua nota del round precedente
function drawNotes() {
  const pool = DIFFICULTY_SETS[cfg.difficulty];
  const result = [];
  for (let i = 0; i < cfg.players; i++) {
    const alreadyPicked = new Set(result);
    // Escludi: note già assegnate questo round + nota precedente del giocatore i
    let available = pool.filter(n => !alreadyPicked.has(n) && n !== prevNotes[i]);
    // Fallback: se non resta nulla, ignora solo il vincolo della nota precedente
    if (available.length === 0) available = pool.filter(n => !alreadyPicked.has(n));
    // Fallback finale: usa tutto il pool
    if (available.length === 0) available = pool;
    result.push(available[Math.floor(Math.random() * available.length)]);
  }
  return result;
}

function onGo() {
  playClick();

  if (phase === 'revealed') {
    // GO dopo il reveal → round successivo
    hideAnswerBars();
    startRound();
    return;
  }

  // phase === 'setup' → avvia animazione note-creator, poi fase di risposta
  phase = 'answering';
  document.getElementById('btn-go').hidden = true;

  const canvas = document.getElementById('staff-canvas');
  drawStaff(canvas, [], cfg.players);

  for (let i = 0; i < cfg.players; i++) {
    document.getElementById(`answer-bar-${i + 1}`).hidden = false;
  }

  startNoteCreatorAnim(canvas, notes, cfg.players);

  if (cfg.timer) {
    timerHandle = setTimeout(() => {
      document.getElementById('spot-cover').hidden = false;
      drawStaffCovered(canvas, cfg.players);
    }, TIMER_MS);
  }
}

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
  const btn = document.getElementById('btn-reveal');
  btn.hidden = !allAnswered;
  btn.style.pointerEvents = allAnswered ? 'auto' : 'none';
}

function startNoteCreatorAnim(canvas, notesArray, playerCount) {
  const creator = document.getElementById('note-creator');
  creator.hidden = false;
  creator.style.transform = `translateX(${TX_START}px)`;

  const centers = getNoteCenters(canvas.width, playerCount);
  // Stage X for each note = canvas left offset + canvas-relative X
  const stageNoteX = centers.map(cx => CANVAS_LEFT_IN_STAGE + cx);
  const revealed = new Array(playerCount).fill(false);

  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / ANIM_DURATION_MS, 1);
    const tx = TX_START + (TX_END - TX_START) * progress;

    creator.style.transform = `translateX(${tx}px)`;

    // Character center in stage coords: center of visible clip window
    const charCenter = 640 + tx;

    let anyNewReveal = false;
    for (let i = 0; i < playerCount; i++) {
      if (!revealed[i] && charCenter >= stageNoteX[i]) {
        revealed[i] = true;
        anyNewReveal = true;
      }
    }

    if (anyNewReveal) {
      playSpray();
      const partial = notesArray.map((n, i) => revealed[i] ? n : null);
      drawStaff(canvas, partial, playerCount);
    }

    if (progress < 1) {
      animHandle = requestAnimationFrame(tick);
    } else {
      creator.hidden = true;
      creator.style.transform = '';
      animHandle = null;
      // Ensure all notes drawn at end
      drawStaff(canvas, notesArray, playerCount);
    }
  }

  animHandle = requestAnimationFrame(tick);
}

function stopNoteCreatorAnim() {
  if (animHandle !== null) {
    cancelAnimationFrame(animHandle);
    animHandle = null;
  }
  const creator = document.getElementById('note-creator');
  creator.hidden = true;
  creator.style.transform = '';
}

function onReveal() {
  playClick();
  phase = 'revealed';
  clearTimeout(timerHandle);
  stopNoteCreatorAnim();
  document.getElementById('spot-cover').hidden = true;
  const revealBtnHide = document.getElementById('btn-reveal');
  revealBtnHide.hidden = true;
  revealBtnHide.style.pointerEvents = 'none';
  document.getElementById('note-creator').hidden = true;

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

  renderScores();

  if (round >= TOTAL_ROUNDS) {
    endGame();
  } else {
    // Mostra GO per passare al round successivo
    document.getElementById('btn-go').hidden = false;
  }
}

function endGame() {
  const maxScore = Math.max(...scores.slice(0, cfg.players));
  for (let i = 0; i < cfg.players; i++) {
    if (scores[i] === maxScore) {
      document.getElementById(`winner-icon-${i + 1}`).hidden = false;
    }
  }
  document.getElementById('btn-go').hidden = true;
  document.getElementById('btn-home').hidden = false;
}

function adjustScore(playerIdx, delta) {
  scores[playerIdx] = Math.max(0, Math.min(5, scores[playerIdx] + delta));
  renderScores();
}

function setAnswerBar(playerIdx, noteKey) {
  const pl = playerIdx + 1;
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
    document.getElementById(`btn-plus-${i}`).hidden = true;
    document.getElementById(`btn-minus-${i}`).hidden = true;
  }
}

function updateRoundDisplay() {
  document.getElementById('round-display').textContent = `${round} / ${TOTAL_ROUNDS}`;
}

function bindGame(onHome) {
  document.getElementById('btn-go').addEventListener('click', onGo);
  document.getElementById('btn-reveal').addEventListener('click', onReveal);
  document.getElementById('btn-home').addEventListener('click', () => {
    playClick();
    clearTimeout(timerHandle);
    stopNoteCreatorAnim();
    phase = 'setup';
    hideAnswerBars();
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
      if (phase !== 'answering') return;
      playClick();
      const dir = e.offsetX > bar.offsetWidth * (1134 / 1280) ? 1 : -1;
      cycleAnswer(i - 1, dir);
    });
  }

  for (let i = 1; i <= 4; i++) {
    document.getElementById(`btn-plus-${i}`)
      .addEventListener('click', () => { playClick(); adjustScore(i - 1, 1); });
    document.getElementById(`btn-minus-${i}`)
      .addEventListener('click', () => { playClick(); adjustScore(i - 1, -1); });
  }
}
