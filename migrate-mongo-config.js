require('dotenv').config();

const config = {
    mongodb: {
        url: process.env.DB_CONNECTION_STRING,
        databaseName: process.env.DB_NAME,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    changelogCollectionName: 'migrations',
    migrationsDir: './migrations',
    migrationFileExtension: '.js',
    useFileHash: false,
    moduleSystem: 'esm',
};

module.exports = config;