const path = require('path');

class AudioManager {

    validateAudio(file, size) {
        const allowedExtensions = ['.wav', '.flac', '.aiff'];
        const extension = path.extname(file.originalFilename);
        const mimetype = file.mimetype;

        if (!allowedExtensions.includes(extension) || !mimetype.startsWith('audio/')) {
            return false;
        }

        if (file.size > size) {
            return false;
        }

        return true;
    }
}

module.exports = AudioManager;
