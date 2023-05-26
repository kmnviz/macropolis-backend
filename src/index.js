require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const formidable = require('formidable');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

const httpPort = process.env.HTTP_PORT;
const routes = require('./routes');
const GoogleCloudPubSubClient = require('./clients/googleCloudPubSubClient');

(async() => {
    if (!httpPort) {
        throw new Error('HTTP Port is missing. Please provide a valid port number!');
    }

    if (!process.env.DB_CONNECTION_STRING) {
        throw new Error('Missing database configuration. Please provide proper configuration in env file.');
    }

    const dbClient = new MongoClient(process.env.DB_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        await dbClient.connect();
        console.info(`Connected to the db named: ${dbClient.db().databaseName}`);
    } catch (error) {
        console.error('Unable to establish a connection to the database. Please check your database configuration and try again, error: ', error);
        process.exit(1);
    }

    app.use((req, res, next) => {
        req.dbClient = dbClient;
        req.db = dbClient.db(process.env.DB_NAME);
        req.formidable = formidable({multiples: true});
        next();
    });
    app.use('/', routes);

    const googleCloudPubSubClient = new GoogleCloudPubSubClient();
    await googleCloudPubSubClient.subscribeToAudioConversionFinishedEvent(dbClient.db(process.env.DB_NAME).collection('items'));

    app.listen(httpPort, async () => {
        console.log(`App listening at port ${httpPort}`);
    });
})();
