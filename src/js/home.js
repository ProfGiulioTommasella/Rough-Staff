import { loadState, saveState } from './state.js';
import { MULTI_DISABLED } from './notes.js';
import { playClick, playNeon, playSpray } from './audio.js';

let state;
let titleInterval = null;

export function initHome(onStart) {
  state = loadState();
  renderHome();
  startTitleAnimation();
  bindHome(onStart);
}

function startTitleAnimation() {
  if (titleInterval) clearInterval(titleInterval);
  const img = document.getElementById('home-title');
  let on = false;
  titleInterval = setInterval(() => {
    on = !on;
    img.src = on ? 'home-horizontal-titleon.png' : 'home-horizontal-titleoff.png';
    if (on) playNeon();
  }, 900);
}

export function stopTitleAnimation() {
  clearInterval(titleInterval);
  titleInterval = null;
}

function renderHome() {
  // Giocatori
  for (let i = 1; i <= 4; i++) {
    const btn = document.getElementById(`btn-players-${i}`);
    btn.src = i === state.players
      ? `btn-giocatori-selected${i}.png`
      : `btn-giocatori-normal${i}.png`;
  }

  // Difficoltà: RIGHI/SPAZI nascosti per 3-4 giocatori; EN label per lingua EN
  const disabledLevels = state.players >= 3 ? MULTI_DISABLED : [];
  const diffEntries = [
    ['RIGHI',     'righi',     'LINES'],
    ['SPAZI',     'spazi',     'SPACES'],
    ['PENTA_1',   'penta1',    null],
    ['PENTA_FULL','pentafull', null],
  ];

  for (const [diff, key, enLabel] of diffEntries) {
    const btn = document.getElementById(`btn-diff-${key}`);
    const isDisabled = disabledLevels.includes(diff);

    if (isDisabled) {
      btn.hidden = true;
      continue;
    }

    btn.hidden = false;
    btn.style.opacity = '';
    btn.style.pointerEvents = '';
    const isSelected = state.difficulty === diff;
    const suffix = isSelected ? 'selected' : 'normal';

    if (state.lang === 'en' && enLabel) {
      btn.src = `btn-difficolta-${key}-${suffix}-EN.png`;
    } else {
      btn.src = `btn-difficolta-${key}-${suffix}.png`;
    }
  }

  // Lingua
  document.getElementById('btn-lang').src =
    `btn-home-horizontal-language-${state.lang}.png`;

  // Timer
  document.getElementById('btn-timer').src = state.timer
    ? 'btn-home-horizontal-timer-on.png'
    : 'btn-home-horizontal-timer-off.png';

  // START visibile solo se tutto selezionato
  document.getElementById('btn-start').hidden = !(state.players && state.difficulty);
}

function bindHome(onStart) {
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`btn-players-${i}`).addEventListener('click', () => {
      playClick();
      state.players = i;
      if (i >= 3 && MULTI_DISABLED.includes(state.difficulty)) {
        state.difficulty = 'PENTA_FULL';
      }
      saveState(state);
      renderHome();
    });
  }

  const diffMap = { righi: 'RIGHI', spazi: 'SPAZI', penta1: 'PENTA_1', pentafull: 'PENTA_FULL' };
  Object.entries(diffMap).forEach(([key, val]) => {
    document.getElementById(`btn-diff-${key}`).addEventListener('click', () => {
      playClick();
      state.difficulty = val;
      saveState(state);
      renderHome();
    });
  });

  document.getElementById('btn-lang').addEventListener('click', () => {
    playClick();
    state.lang = state.lang === 'it' ? 'en' : 'it';
    saveState(state);
    renderHome();
  });

  document.getElementById('btn-timer').addEventListener('click', () => {
    playClick();
    state.timer = !state.timer;
    saveState(state);
    renderHome();
  });

  document.getElementById('btn-start').addEventListener('click', () => {
    if (!state.players || !state.difficulty) return;
    playSpray();
    saveState(state);
    stopTitleAnimation();
    document.getElementById('btn-start').hidden = true;
    onStart(state);
  });
}
