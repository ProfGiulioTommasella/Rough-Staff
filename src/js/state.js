const KEY = 'rough-staff:config';

const DEFAULTS = {
  players: 1,
  difficulty: 'SPAZI',
  timer: false,
  lang: 'it'
};

export function loadState() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
