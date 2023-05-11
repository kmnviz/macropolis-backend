require('dotenv').config();

const config = {
    mongodb: {
        url: `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}`,
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