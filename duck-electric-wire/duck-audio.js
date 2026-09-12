/**
 * duck-audio.js - 純程式碼 Web Audio API 合成音效引擎
 * 零外部音訊檔案依賴，100% 手機秒開，即時演算音效與動態電子 BGM
 */

class DuckAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.currentTempo = 125; // BPM
    this.step = 0;
    this.hasUserInteracted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.hasUserInteracted = true;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      if (this.hasUserInteracted) {
        this.startBGM();
      }
    }
    return this.isMuted;
  }

  // 呆萌鴨叫聲 (Quack)
  playQuack(pitch = 1.0) {
    if (this.isMuted || !this.ctx) return;
    this.init();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // 雙帶通共振模擬鴨嘴聲學諧振
    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(650 * pitch, t);
    filter1.Q.setValueAtTime(4.0, t);

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'bandpass';
    filter2.frequency.setValueAtTime(1400 * pitch, t);
    filter2.Q.setValueAtTime(5.0, t);

    osc.type = 'sawtooth';
    // 鴨叫音調輕微上揚再急墜
    osc.frequency.setValueAtTime(320 * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(420 * pitch, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(240 * pitch, t + 0.22);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(filter1);
    osc.connect(filter2);
    filter1.connect(gain);
    filter2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // 高壓電擊觸電慘叫 (Shock Zap)
  playShock() {
    if (this.isMuted || !this.ctx) return;
    this.init();

    const t = this.ctx.currentTime;

    // 白噪音電弧爆破
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1800, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, t + 0.4);
    noiseFilter.Q.setValueAtTime(3.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    // 同步失真方波脈衝 (50Hz 致命電壓)
    const zapOsc = this.ctx.createOscillator();
    const zapGain = this.ctx.createGain();
    zapOsc.type = 'sawtooth';
    zapOsc.frequency.setValueAtTime(80, t);
    zapOsc.frequency.linearRampToValueAtTime(30, t + 0.35);

    zapGain.gain.setValueAtTime(0.4, t);
    zapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    zapOsc.connect(zapGain);
    zapGain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.41);
    zapOsc.start(t);
    zapOsc.stop(t + 0.36);

    // 觸電後追加一聲哀鳴鴨叫
    setTimeout(() => {
      this.playQuack(0.7);
    }, 120);
  }

  // 接近危險電壁或機關時的微弱電火花嘶嘶聲
  playNearSpark() {
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200 + Math.random() * 800, t);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // 活塞撞錘/雷射預警嗶嗶聲
  playWarningBeep() {
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(1174, t + 0.05);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  // 勝利通關高昂號角 (Victory Fanfare)
  playVictory() {
    if (this.isMuted || !this.ctx) return;
    this.init();

    const notes = [
      { f: 523.25, d: 0.12, delay: 0 },      // C5
      { f: 659.25, d: 0.12, delay: 0.13 },   // E5
      { f: 783.99, d: 0.14, delay: 0.26 },   // G5
      { f: 1046.5, d: 0.40, delay: 0.40 },   // C6
      { f: 987.77, d: 0.15, delay: 0.85 },   // B5
      { f: 1046.5, d: 0.80, delay: 1.02 }    // C6 Hold
    ];

    notes.forEach(n => {
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + n.d + 0.02);
      }, n.delay * 1000);
    });

    // 連續快樂歡呼鴨叫
    setTimeout(() => this.playQuack(1.2), 300);
    setTimeout(() => this.playQuack(1.4), 600);
    setTimeout(() => this.playQuack(1.3), 900);
  }

  // 動態合成電子 BGM (Cyber Synth Bassline)
  startBGM() {
    if (this.bgmPlaying || this.isMuted) return;
    this.init();
    this.bgmPlaying = true;
    this.step = 0;
    this.scheduleBGMStep();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  setDangerLevel(level) {
    // 隨關卡推進 (0.0 到 1.0)，微幅加速節奏 (120 ~ 145 BPM)
    this.currentTempo = 120 + Math.floor(level * 25);
  }

  scheduleBGMStep() {
    if (!this.bgmPlaying || !this.ctx || this.isMuted) return;

    const interval = (60 / this.currentTempo) / 4; // 16分音符
    this.playSynthBeat(this.step);
    this.step = (this.step + 1) % 16;

    this.bgmTimer = setTimeout(() => {
      this.scheduleBGMStep();
    }, interval * 1000);
  }

  playSynthBeat(step) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // 基礎電子鼓節拍 (Kick on 0, 4, 8, 12)
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    }

    // 輕巧 Hi-Hat (on 2, 6, 10, 14)
    if (step % 4 === 2) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(6000, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    }

    // 緊張脈衝 Bassline 音符 (A小調 16 步循環)
    const bassScale = [110, 110, 130.8, 110, 146.8, 110, 130.8, 123.5, 110, 110, 164.8, 146.8, 110, 123.5, 130.8, 98];
    const freq = bassScale[step];

    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    const bassFilter = this.ctx.createBiquadFilter();

    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(freq, t);

    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(450, t);
    bassFilter.frequency.exponentialRampToValueAtTime(150, t + 0.1);

    bassGain.gain.setValueAtTime(0.08, t);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.ctx.destination);

    bassOsc.start(t);
    bassOsc.stop(t + 0.12);
  }
}

window.duckAudio = new DuckAudioEngine();
