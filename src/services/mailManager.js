const nodemailer = require('nodemailer');

class MailManager {

    constructor() {
        this._client = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_HOST,
            secure: true,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
        });
    }

    async sendSignUpConfirmationRequest(email, username, confirmationHash) {
        const mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: `Please confirm your registration on ${process.env.APP_NAME}`,
            html: `<p>Confirm your email visiting <a href="${process.env.FRONTEND_URL}/sign-in?username=${username}&confirmationHash=${confirmationHash}">this link</a>.</p>`,
        };

        await this._client.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new Error(error);
            } else {
                if (info.response !== 'info') {
                    throw new Error('Something went wrong, not received status 250');
                }
            }
        });
    }

    async sendRestorePasswordLinkRequest(email, restorePasswordHash) {
        const mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: `Restore password link for ${process.env.APP_NAME}`,
            html: `
            <p>Your have requested restore password link. Visit <a href="${process.env.FRONTEND_URL}/forgot-password?restorePasswordHash=${restorePasswordHash}">link</a> to set new password.</p>
        `,
        };

        await this._client.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new Error(error);
            } else {
                if (info.response !== 'info') {
                    throw new Error('Something went wrong, not received status 250');
                }
            }
        });
    }

    async sendDownloadLink(email, downloadId) {
        const mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: `You have just bought a collection from ${process.env.APP_NAME}`,
            html: `<p>Download file from <a href="${process.env.FRONTEND_URL}/download?id=${downloadId}">this link</a>. The link will be available 7 days</p>`,
        };

        await this._client.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new Error(error);
            } else {
                if (info.response !== 'info') {
                    throw new Error('Something went wrong, not received status 250');
                }
            }
        });
    }

    async sendPurchasedItemMessage(email, itemName, itemPrice) {
        const mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: `Your item ${itemName} has been purchased`,
            html: `<p>${itemName} was purchased on ${process.env.APP_NAME}. You have earned ${itemPrice}</p>`,
        };

        await this._client.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new Error(error);
            } else {
                if (info.response !== 'info') {
                    throw new Error('Something went wrong, not received status 250');
                }
            }
        });
    }

    async sendPurchasedCollectionMessage(email, collectionName, collectionPrice) {
        const mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: `Your collection ${collectionName} has been purchased`,
            html: `<p>${collectionName} was purchased on ${process.env.APP_NAME}. You have earned ${collectionPrice}</p>`,
        };

        await this._client.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new Error(error);
            } else {
                if (info.response !== 'info') {
                    throw new Error('Something went wrong, not received status 250');
                }
            }
        });
    }
}

module.exports = MailManager;