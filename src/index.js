require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const formidable = require('formidable');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

// app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
const corsOptions = (req, callback) => {
    const allowedOrigins = [process.env.FRONTEND_URL,
        'https://api.stripe.com',
        'https://events.stripe.com',
        'https://hooks.stripe.com',
        'https://dashboard.stripe.com'
    ];
    const origin = req.header('Origin');

    if (allowedOrigins.indexOf(origin) !== -1) {
        const corsOptions = {
            origin: true,
            credentials: origin === process.env.FRONTEND_URL,
        };
        callback(null, corsOptions);
    } else {
        callback(new Error('Not allowed by CORS'));
    }
}

app.use(cors(corsOptions));

const httpServer = http.createServer(app);
const httpPort = process.env.HTTP_PORT;
const routes = require('./routes');
const GoogleCloudPubSubClient = require('./clients/googleCloudPubSubClient');

(async() => {
    if (!httpPort) {
        console.log('http port not set.')
        process.exit(1);
    }

    if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_NAME) {
        console.log('database properties not set.')
        process.exit(1);
    }

    const dbClient = new MongoClient(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        await dbClient.connect();
        console.log('Connected to the db named: ' + dbClient.db().databaseName);
    } catch (error) {
        console.log('Couldn\'t connect to the db. error: ', error);
        process.exit(1);
    }

    app.use((req, res, next) => {
        req.dbClient = dbClient;
        req.db = dbClient.db(process.env.DB_NAME);
        req.formidable = formidable();
        next();
    });
    app.use('/', routes);

    const googleCloudPubSubClient = new GoogleCloudPubSubClient();
    await googleCloudPubSubClient.subscribeToAudioConversionFinishedEvent(dbClient.db(process.env.DB_NAME).collection('items'));

    httpServer.listen(httpPort, async () => {
        console.log(`App listening at port ${httpPort}`);
    });
})();
