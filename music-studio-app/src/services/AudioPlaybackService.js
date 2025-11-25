// Audio playback service using Web Audio API
class AudioPlaybackService {
    constructor() {
        this.audioContext = null;
        this.audioBuffers = new Map(); // Store loaded audio buffers
        this.activeSources = []; // Track active audio sources
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    async loadAudioFromUri(uri, clipId) {
        this.init();

        try {
            // Fetch audio file
            const response = await fetch(uri);
            const arrayBuffer = await response.arrayBuffer();

            // Decode audio data
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            // Store in cache
            this.audioBuffers.set(clipId, audioBuffer);

            return audioBuffer;
        } catch (error) {
            console.error('Error loading audio:', error);
            return null;
        }
    }

    playClip(clip, startOffset = 0) {
        this.init();

        return new Promise(async (resolve) => {
            try {
                // Get or load audio buffer
                let audioBuffer = this.audioBuffers.get(clip.id);
                if (!audioBuffer) {
                    audioBuffer = await this.loadAudioFromUri(clip.audioUri, clip.id);
                    if (!audioBuffer) {
                        resolve();
                        return;
                    }
                }

                // Create source
                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.audioContext.destination);

                // Calculate when to start playing this clip
                const clipStartTime = clip.startTime / 1000; // Convert to seconds
                const currentPlaybackTime = startOffset / 1000;

                // Only play if we're past the clip's start time
                if (currentPlaybackTime >= clipStartTime) {
                    const offsetIntoClip = currentPlaybackTime - clipStartTime;
                    source.start(0, offsetIntoClip);
                } else {
                    // Schedule to start in the future
                    const delay = clipStartTime - currentPlaybackTime;
                    source.start(this.audioContext.currentTime + delay);
                }

                // Track active source
                this.activeSources.push(source);

                source.onended = () => {
                    this.activeSources = this.activeSources.filter(s => s !== source);
                    resolve();
                };
            } catch (error) {
                console.error('Error playing clip:', error);
                resolve();
            }
        });
    }

    stopAll() {
        this.activeSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Source might already be stopped
            }
        });
        this.activeSources = [];
    }

    async playClips(clips, startTime = 0) {
        this.stopAll();

        // Play all clips that should be playing at this time
        const promises = clips.map(clip => this.playClip(clip, startTime));
        await Promise.all(promises);
    }
    playTestTone() {
        this.init();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();

        // Stop after 1 second
        setTimeout(() => {
            oscillator.stop();
            oscillator.disconnect();
            gainNode.disconnect();
        }, 1000);
    }
}

export default new AudioPlaybackService();
