# Rough Staff — CLAUDE.md

Gioco per la lettura del pentagramma. Porting web di un progetto Scratch (34 sprite).
Progetto originale: `Rough Staff.sb3` (estraibile come ZIP, contiene `project.json`).

## Stack (identico a Groove Master — zero build)

- **Vanilla JS ES modules** — nessun npm, nessun bundler, nessun framework
- **CSS** puro — nessun preprocessore
- **Canvas 2D o SVG** per il pentagramma e le note (da decidere prima di iniziare)
- Servire in locale: `python3 -m http.server 8000` → `http://localhost:8000`
- Deploy: file statici, nessun server

## Cos'è il gioco

1. **Home**: scegli numero giocatori (1–4) e difficoltà
2. **Match**: appare una nota sul pentagramma, ogni giocatore sceglie la risposta (DO–SI)
3. **Reveal**: il pulsante GO! rivela la nota corretta
4. **Punteggio**: token per giocatore (0–5), più round per partita

## Modello dati core

### Note e posizioni Y sul pentagramma (dal Scratch originale)

| Difficoltà | Note disponibili | N. note |
|---|---|---|
| RIGHI (linee) | MI(b), SOL, SI, RE, FA(a) | 5 |
| SPAZI | FA(b), LA, DO, MI(a) | 4 |
| PENTA 1 | MI(b)→FA(a) | 9 |
| PENTA FULL | DO(b)→DO(a) | 10 |

Posizioni Y in pixel (coordinate Scratch, da convertire in CSS/Canvas):

```js
// PENTA FULL — 10 note, dal basso verso l'alto
const NOTE_Y = {
  'DO (b)': -66, 'RE (b)': -54, 'MI (b)': -42,
  'FA (b)': -31, 'SOL':    -20, 'LA':     -10,
  'SI':       0, 'MI (a)':  10, 'FA (a)':  20,
  'DO (a)':  31
};

// PENTA 1 — 9 note
const NOTE_Y_PENTA1 = {
  'MI (b)': -42, 'FA (b)': -31, 'SOL': -20,
  'LA': -10, 'SI': 0, 'DO': 10, 'RE': 20,
  'MI (a)': 31, 'FA (a)': 40
};
```

### Variabili globali Scratch → stato JS

| Scratch | JS | Valori |
|---|---|---|
| `Players Number` | `state.players` | 1–4 |
| `DIFFICULTY:` | `state.difficulty` | `'RIGHI'`\|`'SPAZI'`\|`'PENTA_1'`\|`'PENTA_FULL'` |
| `Game:` | `state.round` | es. `'2-5'` (round corrente / totale) |
| `PL S:` / `PL1:` … `PL4:` | `state.answers[i]` | `'?'` o nome nota |
| `nota scelta` (lista) | `state.currentNotes` | array nomi nota per slot |
| `Nth scelta` | `state.noteY[i]` | coordinata Y nota sorteggiata |

### Flusso eventi Scratch → eventi JS

| Broadcast Scratch | Evento JS equivalente |
|---|---|
| `BACK HOME` | `game.emit('home')` |
| `START MATCH` | `game.emit('startMatch')` |
| `Show Single Player` | `game.emit('showSinglePlayer')` |
| `Show PLAYERS` | `game.emit('showPlayers', n)` |
| `Reveal Answer` | `game.emit('revealAnswer')` |

## Struttura file suggerita (da creare)

```
index.html              unico HTML — Home + schermata di gioco
src/css/style.css       stili + responsive
src/js/notes.js         NOTE_Y, DIFFICULTY_SETS — dati fissi, immutabile
src/js/state.js         loadState/saveState via localStorage
src/js/staff.js         rendering pentagramma + nota (Canvas o SVG)
src/js/home.js          logica Home (giocatori, difficoltà, Start)
src/js/game.js          logica match (sorteggio, risposte, punteggio, GO!)
assets/audio/           suoni (finger snap, gate, water drop, ecc.)
assets/sprites/         chiave di violino SVG, token giocatori, pulsanti
```

## Sprite Scratch → componenti web

| Sprite Scratch | Componente web |
|---|---|
| `Rigo` / `Rigo 6` | `<canvas>` o `<svg>` del pentagramma |
| `Chiave di VIolino` | immagine SVG fissa |
| `Battute` | separatori di battuta (layout 1–4 giocatori) |
| `Single Player` / `1st PL` … `4th PL` | note sorteggiata per slot giocatore |
| `AN SP` / `AN 1ST PL` … | pulsanti risposta (DO–SI) per giocatore |
| `SingPL but` / `2 PL but` … | selettori numero giocatori (Home) |
| `button full/penta/righi/spazi` | selettori difficoltà (Home) |
| `Pl 0–4 tok` | indicatori punteggio (token 0–5 per giocatore) |
| `GO!` | pulsante Reveal/Next |
| `Home Button` | ritorno Home |
| `joker button` | jolly (regola da definire) |
| `porta 1` | animazione porta (transizione schermata) |

## Invarianti — NON modificare senza discussione

- **Nessun build tool**: no npm/package.json/webpack/vite
- **Nessun framework**: no React/Vue/Svelte
- **Un solo HTML**: index.html gestisce Home + schermata di gioco
- **ES modules nativi**: `import`/`export`, nessun CommonJS
- `notes.js` contiene solo dati fissi — nessuna logica lì dentro
- Le posizioni Y delle note sono in coordinate Scratch: Y=0 è centro pentagramma (SI)
  positivo = su, negativo = giù — invertire rispetto al CSS (`top`)

## Decisioni da prendere prima di scrivere codice

- [ ] **Canvas vs SVG** per il pentagramma (Canvas = più controllo, SVG = più accessibile)
- [ ] **Layout multi-giocatore**: 4 pentagrammi separati o uno condiviso?
- [ ] **Numero round** per partita: fisso (5?) o configurabile?
- [ ] **Joker button**: che funzione ha? (da chiarire col committente)

## Branch e workflow

- Branch: `claude/rough-staff-descrizione-vN`
- Mai pushare su `main` direttamente
- Commit atomici per funzionalità, push con `git push -u origin <branch>`
