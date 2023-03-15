const imageSize = require('image-size');
const sharp = require('sharp');
const path = require('path');

class ImageManager {

    async resizeImage(buffer) {
        let size, ratio, type, outputs = {};

        size = await imageSize(buffer);
        ratio = size.width / size.height;
        type = size.type;

        const jpegOptions = { mozjpeg: true };
        outputs['1920'] = await sharp(buffer).resize(1920, Math.ceil(1920 / ratio)).jpeg(jpegOptions).toBuffer();
        outputs['960'] = await sharp(buffer).resize(960, Math.ceil(960 / ratio)).jpeg(jpegOptions).toBuffer();
        outputs['480'] = await sharp(buffer).resize(480, Math.ceil(480 / ratio)).jpeg(jpegOptions).toBuffer();
        outputs['240'] = await sharp(buffer).resize(240, Math.ceil(240 / ratio)).jpeg(jpegOptions).toBuffer();
        outputs['120'] = await sharp(buffer).resize(120, Math.ceil(120 / ratio)).jpeg(jpegOptions).toBuffer();
        outputs['80'] = await sharp(buffer).resize(80, Math.ceil(80 / ratio)).jpeg(jpegOptions).toBuffer();

        return { size, ratio, type, outputs };
    }

    validateImage(file, size) {
        const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
        const extension = path.extname(file.originalFilename);
        const mimetype = file.mimetype;

        if (!allowedExtensions.test(extension) || !mimetype.startsWith('image/')) return false;
        if (file.size > size) return false;

        return true;
    }
}

module.exports = ImageManager;
