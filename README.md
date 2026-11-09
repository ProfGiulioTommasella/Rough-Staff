# Rough Staff

Gioco per l'esercitazione della lettura delle note sul pentagramma.
Porting web di un progetto Scratch — stack: Vanilla JS ES modules, CSS puro, Web Audio API.

## Avvio locale

```bash
python3 -m http.server 8000
# apri http://localhost:8000
```

Nessun build tool, nessun npm install.

## Struttura

```
index.html          unico HTML (home + schermata di gioco)
src/css/style.css   tutti gli stili
src/js/             moduli ES (game.js, home.js, staff.js, audio.js, …)
*.png               sprite 5120×3072 (4× del palco 1280×768)
```

## Note critiche sugli asset

### Sprite PNG

Tutti gli sprite sono PNG a piena risoluzione `5120×3072` (4× del palco logico `1280×768`).
Il ritaglio avviene via CSS `clip-path: inset(top% right% bottom% left%)` — l'immagine
occupa sempre `1280×768` (via `object-fit: fill`), la percentuale taglia la porzione visibile.

### Nomi dei file di sfondo

| File corretto | Note |
|---|---|
| `bg-home-horizontal.png` | sfondo HOME — usare questo |
| `bg-game-horizontal.png` | sfondo GAME — usare questo (pulito, senza macchie) |

**Non usare** `horizontal-bg-home.png` / `horizontal-bg-game.png` (alias vecchi, eliminati).

### `btn-home-horizontal-startoff.png`

È la **bomboletta spray rosa al neon con la scritta START**.
Viene usata **solo** come `src` di `#btn-start` nella HOME screen.
La sua visibilità è controllata tramite `style.opacity` / `style.pointerEvents`
(mai tramite l'attributo `hidden`, che viene bloccato da `[hidden]{display:none!important}`).

Nel HTML la sua inizializzazione corretta è:
```html
<img id="btn-start" src="btn-home-horizontal-startoff.png"
     alt="Start" style="opacity:0;pointer-events:none">
```

**NON inserire mai questo file come sfondo o overlay nella schermata di gioco.**

### Visibilità di `#btn-start`

`home.js` gestisce il pulsante START **solo via `style.opacity`**:
- `opacity: 0` + `pointerEvents: none` → nascosto
- `opacity: 1` + `pointerEvents: ''` → visibile e cliccabile

Impostare `hidden` sull'elemento lo blocca permanentemente perché:
```css
[hidden] { display: none !important; }  /* in style.css */
```
sovrascrive qualsiasi tentativo di mostrarlo tramite JS.

## Deploy (GitHub Pages)

Il workflow `.github/workflows/deploy.yml` si attiva su `push: main` e `workflow_dispatch`.
Dopo ogni merge su `main` il sito si aggiorna automaticamente.
