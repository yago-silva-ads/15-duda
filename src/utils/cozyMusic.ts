/**
 * Aaliyah 2000s Black R&B Music Engine (Dual Engine: HTML5 Audio + Web Audio API)
 * Inspirada nos maiores clássicos de Aaliyah e Timbaland ("Rock The Boat", "Are You That Somebody", "Try Again")
 * Sintetiza em tempo real um loop WAV 16-bit com textura quente de Rhodes, baixo aveludado e groove de R&B.
 */

class AaliyahBlackMusicEngine {
  private audioEl: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isUnlocked: boolean = false;
  private volume: number = 0.46;
  private wavUrl: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.generateAaliyahWavLoop();
    }
  }

  // Gera a faixa de áudio WAV 16-bit com o arranjo R&B suave de Aaliyah
  private generateAaliyahWavLoop() {
    try {
      const sampleRate = 22050; // taxa leve e com reprodução imediata no celular
      const bpm = 88; // BPM clássico de Aaliyah ("Rock The Boat" / "Are You That Somebody")
      const secondsPerBeat = 60 / bpm; // ~0.681s por batida
      const totalBars = 4;
      const totalSeconds = secondsPerBeat * 4 * totalBars; // ~10.9 segundos de loop contínuo
      const totalSamples = Math.floor(sampleRate * totalSeconds);

      const buffer = new Float32Array(totalSamples);

      // Função para sintetizar acorde de Fender Rhodes aveludado com efeito de chorus
      const addRhodesNote = (freq: number, startSec: number, durationSec: number, gain: number = 0.22) => {
        const startSample = Math.floor(startSec * sampleRate);
        const endSample = Math.min(totalSamples, startSample + Math.floor(durationSec * sampleRate));

        for (let i = startSample; i < endSample; i++) {
          const t = (i - startSample) / sampleRate;
          // Envelope: ataque macio (0.015s) e decaimento aveludado
          const env = t < 0.015 ? t / 0.015 : Math.exp(-2.6 * (t - 0.015));

          // Efeito de Chorus analógico clássico dos anos 2000 (duas ondas ligeiramente desafinadas)
          const f1 = freq;
          const f2 = freq * 1.003;
          const fundamental = 0.6 * Math.sin(2 * Math.PI * f1 * t) + 0.4 * Math.sin(2 * Math.PI * f2 * t);
          const secondHarm = 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
          const thirdHarm = 0.12 * Math.sin(2 * Math.PI * freq * 3 * t);

          buffer[i] += (fundamental + secondHarm + thirdHarm) * env * gain;
        }
      };

      // Função para Baixo R&B / Neo-Soul encorpado e redondo
      const addBass = (freq: number, startSec: number, durationSec: number, gain: number = 0.35) => {
        const startSample = Math.floor(startSec * sampleRate);
        const endSample = Math.min(totalSamples, startSample + Math.floor(durationSec * sampleRate));

        for (let i = startSample; i < endSample; i++) {
          const t = (i - startSample) / sampleRate;
          const env = t < 0.02 ? t / 0.02 : Math.exp(-3.0 * (t - 0.02));
          // Sub-grave + harmônico suave
          const sub = Math.sin(2 * Math.PI * freq * t);
          const warm = 0.35 * Math.sin(2 * Math.PI * freq * 2 * t);
          buffer[i] += (sub + warm) * env * gain;
        }
      };

      // Função para dedilhado de guitarra limpa / harpa R&B (melodia sedutora de Aaliyah)
      const addMelodyPluck = (freq: number, startSec: number, durationSec: number = 0.8, gain: number = 0.28) => {
        const startSample = Math.floor(startSec * sampleRate);
        const endSample = Math.min(totalSamples, startSample + Math.floor(durationSec * sampleRate));

        for (let i = startSample; i < endSample; i++) {
          const t = (i - startSample) / sampleRate;
          const env = t < 0.008 ? t / 0.008 : Math.exp(-4.5 * (t - 0.008));
          const wave = Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
          buffer[i] += wave * env * gain;
        }
      };

      // Bateria R&B anos 2000 (Kick aveludado e suave)
      const addKick = (startSec: number) => {
        const startSample = Math.floor(startSec * sampleRate);
        const durationSec = 0.25;
        const endSample = Math.min(totalSamples, startSample + Math.floor(durationSec * sampleRate));

        for (let i = startSample; i < endSample; i++) {
          const t = (i - startSample) / sampleRate;
          const currentFreq = 110 * Math.exp(-22 * t) + 42;
          const env = Math.exp(-14 * t);
          buffer[i] += Math.sin(2 * Math.PI * currentFreq * t) * env * 0.36;
        }
      };

      // Estalo elegante de caixa / rimshot de R&B
      const addRimshot = (startSec: number) => {
        const startSample = Math.floor(startSec * sampleRate);
        const durationSec = 0.12;
        const endSample = Math.min(totalSamples, startSample + Math.floor(durationSec * sampleRate));

        for (let i = startSample; i < endSample; i++) {
          const t = (i - startSample) / sampleRate;
          const noise = (Math.random() * 2 - 1) * 0.16;
          const woodClick = Math.sin(2 * Math.PI * 920 * t) * 0.22;
          const env = Math.exp(-38 * t);
          buffer[i] += (noise + woodClick) * env;
        }
      };

      // Shaker / chocalho suave em semicolcheias
      const addShaker = (startSec: number, accent: boolean = false) => {
        const startSample = Math.floor(startSec * sampleRate);
        const durationSec = 0.05;
        const endSample = Math.min(totalSamples, startSample + Math.floor(durationSec * sampleRate));
        const gain = accent ? 0.05 : 0.025;

        for (let i = startSample; i < endSample; i++) {
          const t = (i - startSample) / sampleRate;
          const noise = (Math.random() * 2 - 1) * gain;
          const env = Math.exp(-55 * t);
          buffer[i] += noise * env;
        }
      };

      // PROGRESSÃO HARMÔNICA ICÔNICA DE AALIYAH (Tom de Ré Maior / Si Menor)
      // Inspirada na harmonia sofisticada de "Rock The Boat" e "Are You That Somebody"
      // Compasso 1: Dmaj9 (D, F#, A, C#, E)
      // Compasso 2: C#m7 (C#, E, G#, B)
      // Compasso 3: Bm9 (B, D, F#, A, C#)
      // Compasso 4: A9sus4 -> A7 (A, D, E, G -> C#)
      const bars = [
        // Compasso 1: Dmaj9
        {
          start: 0,
          bass: 73.42, // D2
          rhodes: [220.00, 277.18, 329.63, 440.00, 554.37], // A3, C#4, E4, A4, C#5
          melody: [
            { f: 554.37, beat: 0.0 },  // C#5
            { f: 493.88, beat: 0.75 }, // B4
            { f: 440.00, beat: 1.5 },  // A4
            { f: 369.99, beat: 2.25 }, // F#4
            { f: 440.00, beat: 3.0 },  // A4
          ]
        },
        // Compasso 2: C#m7
        {
          start: secondsPerBeat * 4,
          bass: 69.30, // C#2
          rhodes: [207.65, 246.94, 329.63, 415.30], // G#3, B3, E4, G#4
          melody: [
            { f: 415.30, beat: 0.0 },  // G#4
            { f: 369.99, beat: 0.75 }, // F#4
            { f: 329.63, beat: 1.5 },  // E4
            { f: 369.99, beat: 2.25 }, // F#4
            { f: 415.30, beat: 3.0 },  // G#4
          ]
        },
        // Compasso 3: Bm9
        {
          start: secondsPerBeat * 8,
          bass: 61.74, // B1
          rhodes: [185.00, 220.00, 293.66, 369.99, 440.00], // F#3, A3, D4, F#4, A4
          melody: [
            { f: 440.00, beat: 0.0 },  // A4
            { f: 369.99, beat: 0.75 }, // F#4
            { f: 329.63, beat: 1.5 },  // E4
            { f: 293.66, beat: 2.25 }, // D4
            { f: 369.99, beat: 3.0 },  // F#4
          ]
        },
        // Compasso 4: A9 / E (Fechamento aveludado de R&B)
        {
          start: secondsPerBeat * 12,
          bass: 55.00, // A1
          rhodes: [220.00, 277.18, 329.63, 392.00, 493.88], // A3, C#4, E4, G4, B4
          melody: [
            { f: 493.88, beat: 0.0 },  // B4
            { f: 440.00, beat: 0.75 }, // A4
            { f: 369.99, beat: 1.5 },  // F#4
            { f: 440.00, beat: 2.5 },  // A4
            { f: 554.37, beat: 3.25 }, // C#5 (preparação para reiniciar o loop)
          ]
        }
      ];

      // Renderizar compassos na faixa de áudio
      bars.forEach((bar) => {
        // Baixo swingado Timbaland/Aaliyah
        addBass(bar.bass, bar.start, secondsPerBeat * 2.1, 0.36);
        addBass(bar.bass * 1.5, bar.start + secondsPerBeat * 2.25, secondsPerBeat * 0.7, 0.28);
        addBass(bar.bass, bar.start + secondsPerBeat * 3.0, secondsPerBeat * 1.0, 0.32);

        // Rhodes com acordes pontuados e aveludados
        bar.rhodes.forEach((f, idx) => {
          addRhodesNote(f, bar.start + idx * 0.035, 1.8, 0.16);
          addRhodesNote(f, bar.start + secondsPerBeat * 2 + idx * 0.035, 1.4, 0.13);
        });

        // Melodia sedutora de Aaliyah
        bar.melody.forEach((m) => {
          addMelodyPluck(m.f, bar.start + secondsPerBeat * m.beat, 0.8, 0.30);
        });

        // Bateria syncopated de R&B anos 2000
        // Kick no tempo 1 e tempo 2.75 (o clássico contratempo de Timbaland)
        addKick(bar.start);
        addKick(bar.start + secondsPerBeat * 2.75);

        // Rimshot nos tempos 2 e 4
        addRimshot(bar.start + secondsPerBeat);
        addRimshot(bar.start + secondsPerBeat * 3);

        // Shakers em colcheias com swing
        for (let i = 0; i < 8; i++) {
          const shakerTime = bar.start + (secondsPerBeat / 2) * i;
          addShaker(shakerTime, i % 2 === 1);
        }
      });

      // Normalizar e gerar o arquivo WAV
      let maxAmp = 0;
      for (let i = 0; i < totalSamples; i++) {
        if (Math.abs(buffer[i]) > maxAmp) maxAmp = Math.abs(buffer[i]);
      }
      const normFactor = maxAmp > 0 ? 0.92 / maxAmp : 1;

      // Montar cabeçalho RIFF WAV 16-bit PCM
      const dataSize = totalSamples * 2;
      const wavBuffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(wavBuffer);

      view.setUint32(0, 0x52494646, false); // "RIFF"
      view.setUint32(4, 36 + dataSize, true);
      view.setUint32(8, 0x57415645, false); // "WAVE"
      view.setUint32(12, 0x666d7420, false); // "fmt "
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      view.setUint32(36, 0x64617461, false); // "data"
      view.setUint32(40, dataSize, true);

      let offset = 44;
      for (let i = 0; i < totalSamples; i++) {
        const s = Math.max(-1, Math.min(1, buffer[i] * normFactor));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }

      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      this.wavUrl = URL.createObjectURL(blob);

      // Elemento de áudio nativo HTML5 (compatível com qualquer iPhone e Android)
      this.audioEl = new Audio(this.wavUrl);
      this.audioEl.loop = true;
      this.audioEl.volume = this.volume;
      this.audioEl.preload = 'auto';
    } catch {
      //
    }
  }

  // Desbloqueia o áudio em celulares iOS Safari e Android Chrome no primeiro toque
  public unlock() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    if (this.audioEl) {
      this.audioEl.load();
    }

    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx && !this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
  }

  public start() {
    this.unlock();
    this.isPlaying = true;

    if (this.audioEl) {
      this.audioEl.volume = this.volume;
      const playPromise = this.audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy bloqueou até o usuário interagir
        });
      }
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
    }
  }

  public toggle(): boolean {
    this.unlock();
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioEl) {
      this.audioEl.volume = this.volume;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const cozyMusic = new AaliyahBlackMusicEngine();
export const y2kMusic = cozyMusic;
export const aaliyahMusic = cozyMusic;
