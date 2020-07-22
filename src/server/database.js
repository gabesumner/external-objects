const pgp = require('pg-promise')();
const fs = require('fs').promises;
const CsvReader = require('promised-csv');
let db;

// Used to connect to the Heroku Postgres database
function connect() {
    db = pgp({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
}

// Used to disconnect from the Heroku Postgres database.
function disconnect() {
    db.$pool.end();
}

// Return a Promise that returns all folders in the "./data" directory.
function getDataFolders() {
    return fs.readdir('./data');
}

// Return a Promise that drops a given database table.
function dropTable(table) {
    console.log(`- Dropping table: ${table}`);
    return db.any(`DROP TABLE IF EXISTS ${table}`).catch((error) => {
        console.log('ERROR:', error);
    });
}

// Return a Promise reads the "create.sql" file from a given data folder then uses the contents to create a table
const createTable = function (folder) {
    console.log(`- Creating table: ${folder}`);
    return fs
        .readFile(`./data/${folder}/create.sql`, 'utf-8')
        .then((contents) => {
            return db.any(contents).catch((error) => {
                console.log('ERROR:', error);
            });
        });
};

// Return a Promise to insert a CSV parsed row for a given database table
const insertRow = function (table, columns, values) {
    return db
        .any('INSERT INTO $1:name($2:name) VALUES ($3:list)', [
            table,
            columns,
            values
        ])
        .catch((error) => {
            console.log('ERROR:', error);
            throw error;
        });
};

// Return a Promise to the data.csv file for a given folder, then import the data into a database table
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

// Return a Promise to cycle through each folder in ./data, delete the table, recreate it, then populate it with data.
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

// Return a Promise to check whether a database table exists.
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

// Checks see if ANY of the database tables already exist (true if any exist, false if none exist)
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

// Gets a list of all the demo data sources (basically all the folders in ./data)
const GetDatabaseTables = async function () {
    const folders = await getDataFolders();
    console.log(folders);
    return folders;
};

// Resets all the demo data (deletes the tables, then recreates and repopulates them)
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
