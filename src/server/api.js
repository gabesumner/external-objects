// Simple Express server setup to serve for local testing/dev API server
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const database = require('./database.js');
const DIST_DIR = './dist';

const app = express();
app.use(helmet());
app.use(compression());

const PORT = process.env.PORT || 3002;

app.get('/api/list', async (req, res) => {
    console.log('Current working directory: ' + __dirname);
    const tables = await database.GetDatabaseTables();
    res.json({ tables: tables });
});

app.get('/api/reset', async (req, res) => {
    const status = await database.ResetDatabaseTables();
    res.json({ status: status });
});

app.get('/api/status', async (req, res) => {
    console.log('Current working directory: ' + __dirname);
    const status = await database.DoDatabaseTablesExist();
    res.json({ status: status });
});

app.use(express.static(DIST_DIR));

app.use('*', (req, res) => {
    res.sendFile('index.html', { root: DIST_DIR });
});

app.listen(PORT, async () => {
    const status = await database.DoDatabaseTablesExist();
    if (status === false) {
        console.log('✅  Initializing database tables.');
        database.ResetDatabaseTables();
    } else {
        console.log('✅  Existing database tables detected.');
    }
    console.log(`✅  API Server started.`);
});
