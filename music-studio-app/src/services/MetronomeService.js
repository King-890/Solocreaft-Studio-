import { Platform } from 'react-native';
import UnifiedAudioContext from './UnifiedAudioContext';
import AudioPlaybackService from './AudioPlaybackService';

class MetronomeService {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.tempo = 120;
        this.nextNoteTime = 0.0;
        this.timerID = null;
        this.lookahead = 25.0; // How frequently to call scheduler (ms)
        this.scheduleAheadTime = 0.1; // How far ahead to schedule audio (s)
        this.currentBeat = 0;
        this.onBeat = null; // Callback for UI sync
        
        // Count-in logic
        this.isCountingIn = false;
        this.countInBeats = 4;
        this.onCountInComplete = null;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = UnifiedAudioContext.get();
        }
    }

    start(tempo, onBeat = null, countIn = false, onComplete = null) {
        this.init();
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.tempo = tempo || 120;
        this.onBeat = onBeat;
        this.currentBeat = 0;
        this.isCountingIn = countIn;
        this.onCountInComplete = onComplete;

        this.nextNoteTime = this.audioContext ? this.audioContext.currentTime : 0;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        this.isCountingIn = false;
        if (this.timerID) clearTimeout(this.timerID);
    }

    scheduler() {
        if (!this.isPlaying) return;

        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentBeat, this.nextNoteTime);
            this.advanceNote();
        }
        this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    }

    advanceNote() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += secondsPerBeat;
        this.currentBeat++;
    }

    scheduleNote(beatNumber, time) {
        if (!this.audioContext) return;

        // Visual Sync
        if (this.onBeat) {
            // Use a slight delay to match audio
            setTimeout(() => {
                if (this.isPlaying) this.onBeat(beatNumber % 4);
            }, (time - this.audioContext.currentTime) * 1000);
        }

        // Count-in check
        if (this.isCountingIn && beatNumber >= this.countInBeats) {
            this.isCountingIn = false;
            if (this.onCountInComplete) {
                // Execute completion callback on the next tick
                setTimeout(() => this.onCountInComplete(), (time - this.audioContext.currentTime) * 1000);
            }
        }

        // Create oscillator for click
        const osc = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();

        // Accent on beat 0
        osc.frequency.value = (beatNumber % 4 === 0) ? 1000 : 800;
        
        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.connect(envelope);
        
        const chain = AudioPlaybackService.getTrackSignalChain();
        if (chain && chain.input) {
            envelope.connect(chain.input);
        } else {
            envelope.connect(this.audioContext.destination);
        }

        osc.start(time);
        osc.stop(time + 0.05);
    }

    setTempo(tempo) {
        this.tempo = tempo;
    }
}

export default new MetronomeService();
