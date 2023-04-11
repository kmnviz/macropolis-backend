const Stripe = require('stripe');
const Decimal = require('decimal.js');

class StripeClient {

    static fee(amount) {
        let stripeFee = Math.ceil(new Decimal(amount).mul(0.029).add(30).toNumber());
        return stripeFee < 50 ? 50 : stripeFee;
    }

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

    async createCustomer(email, username) {
        return await this._client.customers.create({
            email: email,
            name: username,
        });
    }

    async createSubscription(customerId, priceId) {
        return await this._client.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_settings: {
                payment_method_types: ['card'],
                save_default_payment_method: 'on_subscription',
            },
        });
    }

    async createPaymentMethod() {
        return await this._client.paymentMethods.create({
            type: 'card',
        });
    }

    async getPaymentIntent(id) {
        return await this._client.paymentIntents.retrieve(id);
    }

    async getProducts() {
        return this._client.products.list();
    }

    async getPrices() {
        return this._client.prices.list();
    }

    async getCustomers() {
        return this._client.customers.list();
    }

    async getPaymentMethod(id) {
        return await this._client.paymentMethods.retrieve(id);
    }

    async updatePaymentIntent(id, data) {
        return await this._client.paymentIntents.update(id, data);
    }

    async updateCustomer(id, defaultPaymentMethodId) {
        return await this._client.customers.update(id, {
            invoice_settings: {
                default_payment_method: defaultPaymentMethodId
            }
        });
    }

    async attachPaymentMethodToCustomer(paymentMethodId, customerId) {
        return await this._client.paymentMethods.attach(paymentMethodId, { customer: customerId });
    }

    async checkIfProductAndPriceExists(productId, priceId) {
        const products = await this.getProducts();
        const prices = await this.getPrices();

        if (products.data.length === 0 || prices.data.length === 0) {
            return false;
        }

        const availableProduct = !!products.data.find(product => product.id === productId);
        const availablePrice = !!prices.data.find(price => price.id === priceId);

        return availableProduct && availablePrice;
    }
}

module.exports = StripeClient;
