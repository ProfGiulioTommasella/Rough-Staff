let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
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
      g.gain.value = 0.45;
      src.connect(g);
      g.connect(ac.destination);
      src.start();
    };
    if (ac.state === 'running') {
      play();
    } else {
      ac.resume().then(play).catch(() => {});
    }
  } catch (e) {}
}
