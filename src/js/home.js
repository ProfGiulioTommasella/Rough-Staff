import { loadState, saveState } from './state.js';
import { MULTI_DISABLED } from './notes.js';

let state;

export function initHome(onStart) {
  state = loadState();
  renderHome();
  bindHome(onStart);
}

function renderHome() {
  // Giocatori
  for (let i = 1; i <= 4; i++) {
    const btn = document.getElementById(`btn-players-${i}`);
    btn.src = i === state.players
      ? `btn-giocatori-selected${i}.png`
      : `btn-giocatori-normal${i}.png`;
  }

  // Difficoltà (con disabilitazione per 3-4 giocatori)
  const disabledLevels = state.players >= 3 ? MULTI_DISABLED : [];
  ['RIGHI', 'SPAZI', 'PENTA_1', 'PENTA_FULL'].forEach(d => {
    const key = d.toLowerCase().replace('_', '');
    const btn = document.getElementById(`btn-diff-${key}`);
    const isSelected = state.difficulty === d;
    const isDisabled = disabledLevels.includes(d);
    btn.src = isSelected && !isDisabled
      ? `btn-difficolta-${key}-selected.png`
      : `btn-difficolta-${key}-normal.png`;
    btn.style.opacity = isDisabled ? '0.35' : '1';
    btn.style.pointerEvents = isDisabled ? 'none' : '';
  });

  // Lingua
  document.getElementById('btn-lang').src =
    `btn-home-horizontal-language-${state.lang}.png`;

  // Timer
  document.getElementById('btn-timer').src = state.timer
    ? 'btn-home-horizontal-timer-on.png'
    : 'btn-home-horizontal-timer-off.png';
}

function bindHome(onStart) {
  // Pulsanti giocatori
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`btn-players-${i}`).addEventListener('click', () => {
      state.players = i;
      // Se il livello attuale è ora disabilitato, resetta a PENTA_FULL
      if (i >= 3 && MULTI_DISABLED.includes(state.difficulty)) {
        state.difficulty = 'PENTA_FULL';
      }
      saveState(state);
      renderHome();
    });
  }

  // Pulsanti difficoltà
  const diffMap = { righi: 'RIGHI', spazi: 'SPAZI', penta1: 'PENTA_1', pentafull: 'PENTA_FULL' };
  Object.entries(diffMap).forEach(([key, val]) => {
    document.getElementById(`btn-diff-${key}`).addEventListener('click', () => {
      state.difficulty = val;
      saveState(state);
      renderHome();
    });
  });

  // Lingua
  document.getElementById('btn-lang').addEventListener('click', () => {
    state.lang = state.lang === 'it' ? 'en' : 'it';
    saveState(state);
    renderHome();
  });

  // Timer
  document.getElementById('btn-timer').addEventListener('click', () => {
    state.timer = !state.timer;
    saveState(state);
    renderHome();
  });

  // Start
  document.getElementById('btn-start').addEventListener('click', () => {
    if (!state.players || !state.difficulty) return;
    saveState(state);
    onStart(state);
  });
}
