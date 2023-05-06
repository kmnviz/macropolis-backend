const imageSize = require('image-size');
const sharp = require('sharp');
const path = require('path');
const GoogleCloudStorageClient = require('../clients/googleCloudStorageClient');
const fs = require("fs");
const crypto = require("crypto");

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

        if (!allowedExtensions.test(extension) || !mimetype.startsWith('image/')) {
            return false;
        }

        return file.size <= size;
    }

    async storeToBucket(file) {
        const googleCloudStorageClient = new GoogleCloudStorageClient();

        const imageBuffer = fs.readFileSync(file.filepath);
        const resizedImageResponse = await this.resizeImage(imageBuffer);
        const newImageFilename = crypto.randomBytes(28).toString('hex');
        const imageFileExtension = file.originalFilename.split('.').pop();

        const uploadImagePromises = Object.keys(resizedImageResponse.outputs)
            .map((key) => {
                const filename = `${key}_${newImageFilename}.${imageFileExtension}`;
                const file = googleCloudStorageClient.imagesBucket.file(filename);
                const stream = file.createWriteStream({ resumable: false });
                return new Promise((resolve, reject) => {
                    stream.on('error', (error) => { reject(error); });
                    stream.on('finish', () => { resolve() });
                    stream.end(resizedImageResponse.outputs[key]);
                });
            });

        try {
            await Promise.all([...uploadImagePromises]);

            return `${newImageFilename}.${imageFileExtension}`;
        } catch (error) {
            throw new error;
        }
    }
}

module.exports = ImageManager;
