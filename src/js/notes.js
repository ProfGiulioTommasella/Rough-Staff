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
// Step fra linee adiacenti = 30px; step linea→spazio = 15px
// RIGHI (linee): MI(b)=63, SOL=30, SI=0, RE=-30, FA(a)=-60
// SPAZI:         FA(b)=47, LA=15,  DO=-15, MI(a)=-45
export const NOTE_Y = {
  'DO(b)':  99,  // linea supplementare sotto, C4
  'RE(b)':  81,  // spazio sotto linea 1, D4
  'MI(b)':  63,  // linea 1, E4
  'FA(b)':  47,  // spazio 1, F4
  'SOL':    30,  // linea 2, G4
  'LA':     15,  // spazio 2, A4
  'SI':      0,  // linea 3 (centro), B4
  'DO':    -15,  // spazio 3, C5 — solo PENTA_1
  'RE':    -30,  // linea 4, D5 — solo PENTA_1
  'MI(a)': -45,  // spazio 4, E5
  'FA(a)': -60,  // linea 5, F5
  'DO(a)': -15   // spazio 3, C5 (DO dell'ottava superiore rispetto a DO(b))
};

// Note che stanno su una linea
export const ON_LINE = new Set(['MI(b)', 'SOL', 'SI', 'RE', 'FA(a)', 'DO(b)']);

// Note che richiedono linee supplementari
export const LEDGER_NOTES = {
  'DO(b)': [99],  // linea supplementare sotto
  'RE(b)': [],    // spazio sotto linea 1, nessuna linea supplementare
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
