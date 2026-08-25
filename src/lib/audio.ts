// AudioFX Web Audio synth port from 2D prototype (PRD Section 10)
class AudioFXService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazy initialize AudioContext on user interaction
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public phoneRing() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.15].forEach((offset) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(440, now + offset);
      osc2.frequency.setValueAtTime(480, now + offset);

      gain.gain.setValueAtTime(0.1, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now + offset);
      osc2.start(now + offset);
      osc1.stop(now + offset + 0.1);
      osc2.stop(now + offset + 0.1);
    });
  }

  public billiardHit(volume: number = 0.2) {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(Math.min(volume, 0.4), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public keyboardTyping() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800 + Math.random() * 400, now);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  public doorBell() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Ding
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Dong
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(523.25, now + 0.3); // C5
    gain2.gain.setValueAtTime(0.15, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.3);
    osc2.stop(now + 1.0);
  }

  public taskSuccess() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  public taskAssigned() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }
}

export const audioFX = new AudioFXService();
