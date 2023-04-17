const axios = require('axios');

class AnyApiClient {

    constructor() {
        this._url = process.env.ANYAPI_URL;
        this._apiKey = process.env.ANYAPI_KEY;
    }

    async validateIban(iban) {
        return await axios.get(`${this._url}/iban?iban${iban}&apiKey=${this._apiKey}`);
    }
}

module.exports = AnyApiClient;
