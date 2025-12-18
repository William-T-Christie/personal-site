/**
 * Buzzword Bingo - Audio Extraction
 * Uses FFmpeg.wasm to extract audio from video files client-side
 */

let ffmpeg = null;
let ffmpegLoaded = false;

/**
 * Load FFmpeg library
 */
async function loadFFmpeg(onProgress) {
    if (ffmpegLoaded && ffmpeg) {
        return ffmpeg;
    }

    try {
        // Dynamic import of FFmpeg
        const { FFmpeg } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
        const { toBlobURL } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js');

        ffmpeg = new FFmpeg();

        // Set up progress logging
        ffmpeg.on('log', ({ message }) => {
            console.log('[FFmpeg]', message);
        });

        ffmpeg.on('progress', ({ progress }) => {
            if (onProgress) {
                onProgress(Math.round(progress * 100));
            }
        });

        // Load FFmpeg core
        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';

        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        ffmpegLoaded = true;
        return ffmpeg;

    } catch (error) {
        console.error('Error loading FFmpeg:', error);
        throw new Error('Failed to load audio processing library. Please refresh and try again.');
    }
}

/**
 * Check if a file is a video or audio file
 */
function getMediaType(file) {
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/webm'];

    if (videoTypes.includes(file.type)) return 'video';
    if (audioTypes.includes(file.type)) return 'audio';

    // Check by extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
    const audioExts = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];

    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';

    return 'unknown';
}

/**
 * Extract audio from a video/audio file
 * Returns an ArrayBuffer of WAV audio
 */
async function extractAudio(file, onProgress) {
    const mediaType = getMediaType(file);

    if (mediaType === 'unknown') {
        throw new Error('Unsupported file type. Please use MP4, WebM, MOV, MP3, WAV, or M4A.');
    }

    // Load FFmpeg if not already loaded
    if (onProgress) onProgress(0, 'Loading audio processor...');

    const ff = await loadFFmpeg((p) => {
        if (onProgress) onProgress(p * 0.3, 'Loading audio processor...');
    });

    // Read the file
    if (onProgress) onProgress(30, 'Reading file...');

    const fileData = await file.arrayBuffer();
    const inputName = 'input' + getExtension(file.name);
    const outputName = 'output.wav';

    // Write input file to FFmpeg virtual filesystem
    await ff.writeFile(inputName, new Uint8Array(fileData));

    // Extract/convert audio to WAV
    // WAV is ideal for Whisper transcription
    if (onProgress) onProgress(40, 'Extracting audio...');

    try {
        // Extract audio, convert to mono 16kHz WAV (optimal for Whisper)
        await ff.exec([
            '-i', inputName,
            '-vn',                    // No video
            '-acodec', 'pcm_s16le',   // PCM 16-bit
            '-ar', '16000',           // 16kHz sample rate (Whisper optimal)
            '-ac', '1',               // Mono
            '-y',                     // Overwrite output
            outputName
        ]);
    } catch (error) {
        console.error('FFmpeg error:', error);
        throw new Error('Failed to extract audio from file. The file may be corrupted or in an unsupported format.');
    }

    // Read output file
    if (onProgress) onProgress(80, 'Finalizing audio...');

    const outputData = await ff.readFile(outputName);

    // Clean up
    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    if (onProgress) onProgress(100, 'Audio extraction complete!');

    return outputData.buffer;
}

/**
 * Get file extension from filename
 */
function getExtension(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? `.${ext}` : '.mp4';
}

/**
 * Convert ArrayBuffer to Blob
 */
function arrayBufferToBlob(buffer, type = 'audio/wav') {
    return new Blob([buffer], { type });
}

/**
 * Get audio duration from ArrayBuffer
 */
async function getAudioDuration(audioBuffer) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBufferDecoded = await audioContext.decodeAudioData(audioBuffer.slice(0));
        const duration = audioBufferDecoded.duration;
        audioContext.close();
        return duration;
    } catch (error) {
        console.error('Error getting audio duration:', error);
        return null;
    }
}

// Export for use in other modules
window.AudioExtractor = {
    loadFFmpeg,
    extractAudio,
    getMediaType,
    arrayBufferToBlob,
    getAudioDuration
};
