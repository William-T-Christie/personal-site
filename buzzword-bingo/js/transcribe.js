/**
 * Buzzword Bingo - Transcription Engine
 * Uses Whisper via Transformers.js for client-side transcription
 */

let transcriber = null;
let modelLoaded = false;

// Model to use - whisper-tiny is smallest/fastest
// Options: 'Xenova/whisper-tiny.en', 'Xenova/whisper-base.en', 'Xenova/whisper-small.en'
const MODEL_ID = 'Xenova/whisper-tiny.en';

/**
 * Load the Whisper model
 */
async function loadModel(onProgress) {
    if (modelLoaded && transcriber) {
        return transcriber;
    }

    try {
        // Dynamic import of transformers.js
        const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');

        // Configure environment
        env.allowLocalModels = false;
        env.useBrowserCache = true;

        // Create transcription pipeline with progress callback
        transcriber = await pipeline('automatic-speech-recognition', MODEL_ID, {
            progress_callback: (progress) => {
                if (onProgress && progress.status === 'progress') {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    onProgress(percent, `Downloading AI model... ${percent}%`);
                } else if (onProgress && progress.status === 'ready') {
                    onProgress(100, 'AI model ready!');
                }
            },
            device: 'webgpu',      // Try WebGPU first
            dtype: 'fp32'          // Use full precision for better compatibility
        });

        modelLoaded = true;
        return transcriber;

    } catch (error) {
        console.error('Error loading model with WebGPU, trying WASM fallback:', error);

        // Fallback to WASM if WebGPU fails
        try {
            const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');

            env.allowLocalModels = false;
            env.useBrowserCache = true;

            transcriber = await pipeline('automatic-speech-recognition', MODEL_ID, {
                progress_callback: (progress) => {
                    if (onProgress && progress.status === 'progress') {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        onProgress(percent, `Downloading AI model... ${percent}%`);
                    }
                }
            });

            modelLoaded = true;
            return transcriber;

        } catch (fallbackError) {
            console.error('Error loading model with WASM:', fallbackError);
            throw new Error('Failed to load transcription model. Your browser may not support this feature.');
        }
    }
}

/**
 * Transcribe audio data
 * @param {ArrayBuffer} audioBuffer - WAV audio data
 * @param {Function} onProgress - Progress callback
 * @returns {string} - Transcribed text
 */
async function transcribe(audioBuffer, onProgress) {
    // Ensure model is loaded
    if (!transcriber) {
        if (onProgress) onProgress(0, 'Loading AI model...');
        await loadModel(onProgress);
    }

    if (onProgress) onProgress(0, 'Starting transcription...');

    try {
        // Convert ArrayBuffer to Float32Array for Whisper
        const audioData = await decodeAudioData(audioBuffer);

        if (onProgress) onProgress(10, 'Analyzing speech...');

        // Run transcription
        const result = await transcriber(audioData, {
            chunk_length_s: 30,      // Process in 30-second chunks
            stride_length_s: 5,      // 5-second overlap between chunks
            return_timestamps: false, // We don't need timestamps
            task: 'transcribe',
            language: 'english'
        });

        if (onProgress) onProgress(100, 'Transcription complete!');

        // Handle different result formats
        if (typeof result === 'string') {
            return result;
        } else if (result && result.text) {
            return result.text;
        } else if (Array.isArray(result)) {
            return result.map(r => r.text || r).join(' ');
        }

        return '';

    } catch (error) {
        console.error('Transcription error:', error);
        throw new Error('Failed to transcribe audio. Please try a different file.');
    }
}

/**
 * Decode WAV audio data to Float32Array
 */
async function decodeAudioData(arrayBuffer) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 16000 // Whisper expects 16kHz
        });

        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

        // Get the audio data as Float32Array
        const audioData = audioBuffer.getChannelData(0);

        // Close the context
        audioContext.close();

        return audioData;

    } catch (error) {
        console.error('Error decoding audio:', error);
        throw new Error('Failed to decode audio file. The file may be corrupted.');
    }
}

/**
 * Check if browser supports required features
 */
function checkBrowserSupport() {
    const issues = [];

    // Check for WebAssembly
    if (typeof WebAssembly === 'undefined') {
        issues.push('WebAssembly not supported');
    }

    // Check for AudioContext
    if (!window.AudioContext && !window.webkitAudioContext) {
        issues.push('Audio processing not supported');
    }

    // Check for ES modules
    try {
        new Function('import("")');
    } catch (e) {
        // This is expected to fail, we're just checking syntax support
    }

    return {
        supported: issues.length === 0,
        issues
    };
}

/**
 * Estimate transcription time based on audio duration
 */
function estimateTranscriptionTime(audioDurationSeconds) {
    // Rough estimate: Whisper-tiny processes about 30 seconds of audio per 10-15 seconds on average hardware
    // So a 30-minute meeting (~1800 seconds) would take about 10-15 minutes
    // This varies widely based on device capabilities
    const ratio = 0.4; // Roughly 40% of audio duration for processing
    return Math.ceil(audioDurationSeconds * ratio);
}

// Export for use in other modules
window.Transcriber = {
    loadModel,
    transcribe,
    checkBrowserSupport,
    estimateTranscriptionTime,
    get isLoaded() { return modelLoaded; }
};
