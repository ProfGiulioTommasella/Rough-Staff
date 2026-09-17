import { loadState, saveState } from './state.js';
import { MULTI_DISABLED } from './notes.js';
import { playClick } from './audio.js';

let state;
let titleInterval = null;

// Bottoni EN generati via Canvas (RIGHI→LINES, SPAZI→SPACES)
const EN_SRCS = {};

async function makeEnButtonSrc(itKey, enLabel, selected) {
  const suffix = selected ? 'selected' : 'normal';
  const cacheKey = `${itKey}-${suffix}`;
  if (EN_SRCS[cacheKey]) return EN_SRCS[cacheKey];

  const img = await new Promise((res, rej) => {
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = () => rej(new Error('img load failed'));
    el.src = `btn-difficolta-${itKey}-${suffix}.png`;
  });

  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 1280, 768);

  // Centri dei bottoni pill nel sistema di coordinate 1280×768
  const C = {
    spazi: { cx: 285, cy: 637, w: 207, h: 82 },
    righi: { cx: 541, cy: 637, w: 205, h: 82 },
  };
  const c = C[itKey];
  const x = c.cx - c.w / 2, y = c.cy - c.h / 2, r = c.h / 2;

  // Campiona il colore di sfondo dal centro del pill
  const px = ctx.getImageData(c.cx, c.cy, 1, 1).data;
  const isDark = px[0] < 150 && px[3] > 50;
  const bg = isDark ? `rgb(${px[0]},${px[1]},${px[2]})` : '#454f5d';

  // Ridisegna il pill con il colore di sfondo (copre il testo IT)
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + c.w - r, y);
  ctx.arcTo(x + c.w, y, x + c.w, y + c.h, r);
  ctx.lineTo(x + r, y + c.h);
  ctx.arcTo(x, y + c.h, x, y, r);
  ctx.closePath();
  ctx.fill();

  // Scrive la label EN con font simile all'originale
  const br = isDark ? px[0] : 69, bg2 = isDark ? px[1] : 79, bb = isDark ? px[2] : 93;
  ctx.fillStyle = `rgb(${Math.max(0, br - 50)},${Math.max(0, bg2 - 50)},${Math.max(0, bb - 50)})`;
  ctx.font = 'bold 19px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(enLabel, c.cx, c.cy);

  EN_SRCS[cacheKey] = canvas.toDataURL();
  return EN_SRCS[cacheKey];
}

// Genera in background all'avvio — pronte prima che l'utente cambi lingua
['spazi', 'righi'].forEach(k => {
  const en = k === 'spazi' ? 'SPACES' : 'LINES';
  ['normal', 'selected'].forEach(s =>
    makeEnButtonSrc(k, en, s === 'selected').catch(() => {})
  );
});

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
      const enSrc = EN_SRCS[`${key}-${suffix}`];
      btn.src = enSrc || `btn-difficolta-${key}-${suffix}.png`;
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
    playClick();
    saveState(state);
    stopTitleAnimation();
    document.getElementById('btn-start').hidden = true;
    onStart(state);
  });
}
