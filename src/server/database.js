'use strict';
const pgp = require('pg-promise')();
const fs = require('fs').promises;
const CsvReader = require('promised-csv');
const process = require('process');
let db;

function connect() {
    db = pgp({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
}

function disconnect() {
    db.$pool.end();
}

async function getDataFolders() {
    return new Promise((resolve) => {
        fs.readdir('./data').then((folders) => {
            resolve(folders);
        });
    });
}

function dropTable(tableName) {
    console.log(`- Dropping table: ${tableName}`);
    return new Promise(function (resolve) {
        db.any(`DROP TABLE IF EXISTS ${tableName}`)
            .then(() => {})
            .catch((error) => {
                console.log('ERROR:', error);
            })
            .finally(() => {
                resolve();
            });
    });
}

const createTable = function (folder) {
    console.log(`- Creating table: ${folder}`);
    return new Promise(function (resolve) {
        fs.readFile(`./data/${folder}/create.sql`, 'utf-8').then((contents) => {
            db.any(contents)
                .then(() => {})
                .catch((error) => {
                    console.log('ERROR:', error);
                })
                .finally(() => {
                    resolve();
                });
        });
    });
};

const insertRow = function (tableName, columns, values) {
    return db
        .any('INSERT INTO $1:name($2:name) VALUES ($3:list)', [
            tableName,
            columns,
            values
        ])
        .catch((error) => {
            console.log('ERROR:', error);
            throw error;
        });
};

const importData = function (folder) {
    console.log(`- Importing data: ${folder}`);
    let promises = [];
    let columns = [];
    let count = 0;
    const reader = new CsvReader();
    reader.on('row', (row) => {
        count++;
        if (count === 1) {
            columns = row;
        } else {
            promises.push(insertRow(folder, columns, row));
        }
    });
    return reader.read(`./data/${folder}/data.csv`).then(async () => {
        await Promise.all(promises);
        return true;
    });
};

const resetDatabaseTables = async function () {
    let promises = [];
    console.log('Resetting Database Tables');
    promises.push(
        await fs.readdir('data').then((folders) => {
            for (let folder of folders) {
                promises.push(
                    dropTable(folder)
                        .then(() => {
                            return createTable(folder);
                        })
                        .then(() => {
                            return importData(folder);
                        })
                );
            }
        })
    );
    return Promise.all(promises);
};

const doesTableExist = function (table) {
    return db
        .any(
            'SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2)',
            ['public', table]
        )
        .then((data) => {
            return data[0].exists;
        })
        .catch((error) => {
            console.log('ERROR:', error);
            throw error;
        });
};

const DoDatabaseTablesExist = async function () {
    let promises = [];
    let i;
    let statuses = [];
    connect();
    const tables = await getDataFolders();
    for (i = 0; i < tables.length; i++) {
        promises.push(doesTableExist(tables[i]));
    }
    await Promise.all(promises)
        .then((values) => {
            statuses = values;
        })
        .catch((error) => {
            console.log('Error: ' + error);
        });
    for (i = 0; i < statuses.length; i++) {
        if (statuses[i] === true) {
            disconnect();
            return true;
        }
    }
    disconnect();
    return false;
};

const GetDatabaseTables = async function () {
    const folders = await getDataFolders();
    console.log(folders);
    return folders;
};

const ResetDatabaseTables = async function () {
    connect();
    const status = await resetDatabaseTables();
    console.log('Reset Database Tables Complete');
    disconnect();
    return status;
};

module.exports = {
    GetDatabaseTables,
    ResetDatabaseTables,
    DoDatabaseTablesExist
};
