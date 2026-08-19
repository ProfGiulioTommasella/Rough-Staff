// Dati fissi — note, posizioni, livelli. Nessuna logica qui.

export const DIFFICULTY_SETS = {
  RIGHI:      ['MI(b)', 'SOL', 'SI', 'RE', 'FA(a)'],
  SPAZI:      ['FA(b)', 'LA', 'DO', 'MI(a)'],
  PENTA_1:    ['MI(b)', 'FA(b)', 'SOL', 'LA', 'SI', 'DO', 'RE', 'MI(a)', 'FA(a)'],
  PENTA_FULL: ['DO(b)', 'RE(b)', 'MI(b)', 'FA(b)', 'SOL', 'LA', 'SI', 'MI(a)', 'FA(a)', 'DO(a)']
};

// Livelli non disponibili con 3-4 giocatori
export const MULTI_DISABLED = ['RIGHI', 'SPAZI'];

// Posizione Y sul Canvas: SI (linea 3) = 0, verso il basso positivo
// Derivate da coordinate Scratch invertite (Scratch: positivo = su)
export const NOTE_Y = {
  'DO(b)':  66,  // prima linea supplementare sotto, C4
  'RE(b)':  54,  // spazio sotto linea 1
  'MI(b)':  42,  // linea 1
  'FA(b)':  31,  // spazio 1
  'SOL':    20,  // linea 2
  'LA':     10,  // spazio 2
  'SI':      0,  // linea 3 (centro)
  'DO':    -10,  // spazio 3 — solo PENTA_1
  'RE':    -20,  // linea 4 — solo PENTA_1
  'MI(a)': -10,  // spazio 3 (PENTA_FULL: equivale a DO nello slot)
  'FA(a)': -20,  // linea 5 (PENTA_FULL)
  'DO(a)': -31   // prima linea supplementare sopra, C6
};

// Note che stanno su una linea (servono per disegnare la testa sulla linea)
export const ON_LINE = new Set(['MI(b)', 'SOL', 'SI', 'RE', 'FA(a)', 'DO(b)', 'DO(a)']);

// Note che richiedono linee supplementari
export const LEDGER_NOTES = {
  'DO(b)': [66],   // una linea supplementare sotto
  'DO(a)': [-31],  // una linea supplementare sopra
  'RE(b)': [],     // nessuna linea (spazio sotto linea 1)
};

// Ordine ciclico delle risposte per lingua (? = neutro iniziale)
export const ANSWER_ORDER_IT = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'];
export const ANSWER_ORDER_EN = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

// Mappa nota → chiave file barra risposta in IT
export const NOTE_TO_BAR_IT = {
  'DO(b)': 'do', 'RE(b)': 're', 'MI(b)': 'mi', 'FA(b)': 'fa',
  'SOL': 'sol', 'LA': 'la', 'SI': 'si',
  'DO': 'do', 'RE': 're', 'MI(a)': 'mi', 'FA(a)': 'fa', 'DO(a)': 'do'
};

// Mappa nota → chiave file barra risposta in EN
export const NOTE_TO_BAR_EN = {
  'DO(b)': 'c', 'RE(b)': 'd', 'MI(b)': 'e', 'FA(b)': 'f',
  'SOL': 'g', 'LA': 'a', 'SI': 'b',
  'DO': 'c', 'RE': 'd', 'MI(a)': 'e', 'FA(a)': 'f', 'DO(a)': 'c'
};
