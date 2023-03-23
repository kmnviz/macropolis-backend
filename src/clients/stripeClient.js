const Stripe = require('stripe');

class StripeClient {

    constructor() {
        this._client = new Stripe(process.env.STRIPE_SECRET_KEY);
        this._currency = 'usd';
        this._payment_method_types = ['card'];
    }

    get client() {
        return this._client;
    }

    get publishableKey() {
        return process.env.STRIPE_PUBLISHABLE_KEY;
    }

    get webhookSecretKey() {
        return process.env.STRIPE_WEBHOOK_SECRET_KEY;
    }

    async createPaymentIntent(amount, metadata) {
        return await this._client.paymentIntents.create({
            amount: amount,
            currency: this._currency,
            payment_method_types: this._payment_method_types,
            metadata: metadata
        });
    }

    async getPaymentIntent(id) {
        return await this._client.paymentIntents.retrieve(id);
    }

    async updatePaymentIntent(id, data) {
        return await this._client.paymentIntents.update(id, data);
    }
}

module.exports = StripeClient;
