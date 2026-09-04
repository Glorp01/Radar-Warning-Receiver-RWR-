// Synthesized RWR audio — every tone is a Web Audio oscillator shaped in code,
// not a sample file, so there's nothing to source/license.
window.RWR = window.RWR || {};

RWR.RwrAudio = class RwrAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.volume = 0.6;
    this._voices = new Map(); // threatId -> { timer, osc?, panner }
  }

  // AudioContext must be created/resumed from inside a user-gesture handler
  // (a click), or browsers silently block audio. Call this lazily, only from
  // the play* methods, which are only ever triggered by button clicks.
  _ensureCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = this.muted ? 0 : v;
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : this.volume;
  }

  // bearing in degrees, 0 = nose. Returns -1 (full left) .. 1 (full right).
  _pan(bearing) {
    const rad = (bearing * Math.PI) / 180;
    return Math.sin(rad);
  }

  _makePanner(bearing) {
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = this._pan(bearing);
    panner.connect(this.master);
    return panner;
  }

  // Slow, occasional beep -- "something's radar swept past me."
  playSearchBlip(id, bearing, freq) {
    this._ensureCtx();
    this._stopVoice(id);
    const panner = this._makePanner(bearing);
    freq = freq || 700;

    const beep = () => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.08);
      osc.connect(gain).connect(panner);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    };
    beep();
    const timer = setInterval(beep, 900);
    this._voices.set(id, { timer, panner });
  }

  // Faster, higher-pitched beep -- single-target-track lock.
  playTrackTone(id, bearing, freq) {
    this._ensureCtx();
    this._stopVoice(id);
    const panner = this._makePanner(bearing);
    freq = freq || 950;

    const beep = () => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.005);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.12);
      osc.connect(gain).connect(panner);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    };
    beep();
    const timer = setInterval(beep, 300);
    this._voices.set(id, { timer, panner });
  }

  // Continuous tone whose pitch flips fast -- missile launch warble.
  playLaunchWarble(id, bearing) {
    this._ensureCtx();
    this._stopVoice(id);
    const panner = this._makePanner(bearing);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    gain.gain.value = 0.22;
    osc.frequency.value = 900;
    osc.connect(gain).connect(panner);
    osc.start();

    let up = true;
    const timer = setInterval(() => {
      osc.frequency.setTargetAtTime(up ? 1400 : 900, this.ctx.currentTime, 0.02);
      up = !up;
    }, 120);

    this._voices.set(id, { timer, osc, panner });
  }

  updateBearing(id, bearing) {
    const v = this._voices.get(id);
    if (v && v.panner) v.panner.pan.value = this._pan(bearing);
  }

  stop(id) {
    this._stopVoice(id);
  }

  stopAll() {
    for (const id of Array.from(this._voices.keys())) this._stopVoice(id);
  }

  _stopVoice(id) {
    const v = this._voices.get(id);
    if (!v) return;
    clearInterval(v.timer);
    if (v.osc) {
      try { v.osc.stop(); } catch (e) { /* already stopped */ }
    }
    this._voices.delete(id);
  }
};
