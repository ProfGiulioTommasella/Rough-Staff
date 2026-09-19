let audioCtx = null;
const bufferCache = {};

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

async function loadBuffer(url) {
  if (bufferCache[url]) return bufferCache[url];
  const ac = getCtx();
  const res = await fetch(url);
  const ab = await res.arrayBuffer();
  const buf = await ac.decodeAudioData(ab);
  bufferCache[url] = buf;
  return buf;
}

function playBuffer(buf, gainValue) {
  try {
    const ac = getCtx();
    if (ac.state !== 'running') return;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const g = ac.createGain();
    g.gain.value = gainValue;
    src.connect(g);
    g.connect(ac.destination);
    src.start();
  } catch (e) {}
}

export function playClick() {
  try {
    const ac = getCtx();
    const play = () => {
      const len = Math.ceil(ac.sampleRate * 0.02); // 20ms
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const t = i / ac.sampleRate;
        d[i] = Math.sin(2 * Math.PI * 1100 * t) * Math.exp(-t / 0.003);
      }
      const src = ac.createBufferSource();
      src.buffer = buf;
      const g = ac.createGain();
      g.gain.value = 0.2;
      src.connect(g);
      g.connect(ac.destination);
      src.start();
    };
    if (ac.state === 'running') play();
    else ac.resume().then(play).catch(() => {});
  } catch (e) {}
}

export async function playSpray() {
  try {
    const buf = await loadBuffer('Spray%20sound.wav');
    playBuffer(buf, 0.45);
  } catch (e) {}
}

export async function playNeon() {
  try {
    const buf = await loadBuffer('rumore%20elettrico%20e%20neon_CORTO.mp3');
    playBuffer(buf, 0.55);
  } catch (e) {}
}

// Pre-carica in background appena il modulo è importato
loadBuffer('Spray%20sound.wav').catch(() => {});
loadBuffer('rumore%20elettrico%20e%20neon_CORTO.mp3').catch(() => {});
