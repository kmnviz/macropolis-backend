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
            from: 'hello@lisenmi.com',
            to: email,
            subject: 'Please confirm your registration on d.space',
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
            from: 'hello@lisenmi.com',
            to: email,
            subject: 'Restore password link for d.space',
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
}

module.exports = MailManager;