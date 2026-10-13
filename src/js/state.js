const KEY = 'rough-staff:config';

const DEFAULTS = {
  players: 1,
  difficulty: null,
  timer: false,
  lang: 'it'
};

export function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULTS, ...stored, difficulty: null };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
