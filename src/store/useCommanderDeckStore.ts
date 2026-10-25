import { create } from 'zustand';

interface CommanderDeckState {
  isOpen: boolean;
  isCombining: boolean;
  openDeck: () => void;
  closeDeck: () => void;
  toggleDeck: () => void;
}

// Web Audio API cyber synth sound effect for combining controls & games
const playCyberWhoosh = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Whoosh / charging oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.38);
    
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.48);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    // Chime upon deck arrival
    setTimeout(() => {
      try {
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        chime.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        chimeGain.gain.setValueAtTime(0.07, ctx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        chime.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chime.start();
        chime.stop(ctx.currentTime + 0.25);
      } catch (e) {
        // ignore
      }
    }, 450);

  } catch (e) {
    // AudioContext blocked or unsupported
  }
};

export const useCommanderDeckStore = create<CommanderDeckState>((set, get) => ({
  isOpen: false,
  isCombining: false,

  openDeck: () => {
    if (get().isOpen) return;
    playCyberWhoosh();
    // Phase 1: Game controls and games combine in center
    set({ isCombining: true, isOpen: false });

    // Phase 2: In ~0.5s (the 5th decisecond), the side menu shows!
    setTimeout(() => {
      set({ isOpen: true, isCombining: false });
    }, 500);
  },

  closeDeck: () => {
    set({ isOpen: false, isCombining: false });
  },

  toggleDeck: () => {
    if (get().isOpen || get().isCombining) {
      get().closeDeck();
    } else {
      get().openDeck();
    }
  }
}));
