const stripe = require('stripe');

class StripeClient {

    constructor() {
        this._client = new stripe(process.env.STRIPE_SECRET_KEY);
        this._currency = 'usd';
        this._payment_method_types = ['card'];
    }

    get client() {
        return this._client;
    }

    async createPaymentIntent(product, username) {
        return await this._client.paymentIntents.create({
            // amount: product.price,
            // currency: this._currency,
            // payment_method_types: this._payment_method_types,
            // metadata: {
            //     uuid: product.uuid,
            //     username: username,
            // },
        });
    }

    async getPaymentIntent(id) {
        return await this._client.paymentIntents.retrieve(id);
    }

    async updatePaymentIntent(id, data) {
        return await this._client.paymentIntents.update(id, data);
    }
}

export default StripeClient;
