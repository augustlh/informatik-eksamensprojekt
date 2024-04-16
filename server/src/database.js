// Imports module dependencies
import mysql from 'mysql2'
import dotenv from 'dotenv'

import { encrypt, decrypt, hash, generateSalt } from './encryption.js'

// Configures the environment variables
dotenv.config()

// Defines a global variable to store the database pool
let pool = null;

/**
 * Function to create a new mysql pool
 * @returns {mysql.Pool} - A new mysql pool
 */
function createDatabasePool() {
    return mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    })
}

/**
 * Function to delete the database pool
 * @returns {void}
 */
function deleteDatabasePool() {
    if (pool){
        pool.end();
        pool = null;
    }
}

/**
 * Function to create a new user in the database
 * @param {string} name - The name of the user
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {Promise<boolean>} - A promise that resolves to true if the user is created, false otherwise
 * @async
 */
async function createUser(name, email, password) {
    if(!pool) pool = createDatabasePool();
    const [existingUser] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
        console.log('Email: ' + email + ' er allerede i brug');
        return null;
    }

    let salt = generateSalt();

    await pool.promise().query('INSERT INTO users (name, email, password, salt) VALUES (?, ?, ?, ?)', [name, email, hash(password, salt), salt]);
    console.log('Bruger oprettet');
    await createVault(await getUser(email), 'default')
    return true;
}

/**
 * Gets a user from the database by email
 * @param {string} email 
 * @returns {Promise} - A promise that resolves to the user
 * @async
 */
async function getUser(email){
    if(!pool) pool = createDatabasePool();
    const [rows] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
}

/**
 * Validates a user by email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise} - A promise that resolves to the user if the user is valid, otherwise null
 * @async
 */
async function validateUser(email, password) {
    const user = await getUser(email);
    if (user && user.password === hash(password, user.salt)) {
        return user;
    }
    return null;
}

/**
 * Logs in a user by email and password and returns the user if the user is valid
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} - A promise that resolves to the user if the user is valid, otherwise null
 * @async
 */
async function loginUser(email, password) {
    const user = await validateUser(email, password);
    if (user) {
        console.log('Succesfuld login for bruger: ' + user.email);
        return user;
    } else {
        console.log('De indtastede oplysninger er forkerte');
    }
    deleteDatabasePool();
}

/**
 * Gets all vaults for a user by id
 * @param {number} id - The id of the user
 * @returns {Promise} - A promise that resolves to the vaults
 * @async
 */
async function getUserVaults(id){
    if(!pool) pool = createDatabasePool();
    const [rows] = await pool.promise().query('SELECT * from vaults WHERE user_id = ? ', [id])
    if(rows.length === 0){
        return undefined;
    }
    return rows;
}

/**
 * Creates a new vault for a user
 * @param {object} user - The user object
 * @param {string} vault_name - The name of the vault
 * @async
 */
async function createVault(user, vault_name){
    if(!pool) pool = createDatabasePool();
    const [existingVault] = await pool.promise().query('SELECT * FROM vaults WHERE user_id = ? AND vault_name = ?', [user.id, vault_name]);

    if (existingVault.length > 0) {
        console.log('Vault med navn ' + vault_name + ' eksisterer allerede for bruger ' + user.email);
        return false;
    }
    console.log(user.id)

    await pool.promise().query('INSERT INTO vaults (user_id, vault_name) VALUES (?, ?)', [user.id, vault_name]);
    console.log('Vault oprettet for bruger: ' + user.email + ' med name ' + vault_name);
    return true;
}

/**
 * Gets all entries for a vault
 * @param {object} vault - The vault object
 * @returns {Promise} - A promise that resolves to the entries
 * @async
 */
async function getVaultEntries(vault){
    if(!pool) pool = createDatabasePool();
    const [rows] = await pool.promise().query('SELECT * from entries WHERE vault_id = ? ', [vault.vault_id])
    if(rows.length === 0){
        return undefined;
    }
    return rows;
}

/**
 * Creates a new entry for a vault
 * @param {object} vault - The vault object
 * @param {string} website - The website of the entry
 * @param {string} username - The username of the entry
 * @param {string} password - The password of the entry
 * @param {string} masterpassword - The masterpassword of the user
 * @returns {Promise} - A promise that resolves to true if the entry is created, false otherwise
 * @async
 */
async function createEntry(vault, website, username, password, masterpassword){
    if(!pool) pool = createDatabasePool();
    const [existingEntry] = await pool.promise().query('SELECT * FROM entries WHERE vault_id = ? AND website = ? AND username = ?', [vault.vault_id, website, username]);

    if (existingEntry.length > 0) {
        console.log('Entry med website ' + website + ' og username ' + username + ' eksisterer allerede i vault ' + vault.vault_id);
        return false;
    }
    
    const salt = generateSalt();
    const encryptedPassword = await encrypt(password, masterpassword, salt);
    await pool.promise().query('INSERT INTO entries (vault_id, website, username, password, iv, salt) VALUES (?, ?, ?, ?, ?, ?)', [vault.vault_id, website, username, encryptedPassword.encryptedData, encryptedPassword.iv, salt]);
    console.log('Entry oprettet for vault: ' + vault.vault_id + ' med website ' + website + ' og username ' + username);

    return true;
}

/**
 * Decrypts an entry
 * @param {object} entry - The entry object
 * @param {string} masterpassword - The masterpassword of the user
 * @returns {Promise} - A promise that resolves to the decrypted password
 * @async
 */
async function decryptEntry(entry, masterpassword){
    const decryptedPassword = decrypt(entry.password, masterpassword, entry.iv, entry.salt);
    return decryptedPassword;
}

/**
 * Gets all entries for a vault with a specific website
 * @param {object} vault - The vault object
 * @param {string} website - The website of the entry
 * @returns {Promise} - A promise that resolves to the entries
 * @async
 */
async function getEntriesWithWebsite(vault, website){
    if(!pool) pool = createDatabasePool();
    const [rows] = await pool.promise().query('SELECT * from entries WHERE vault_id = ? AND website = ?', [vault.vault_id, website])
    if(rows.length === 0){
        return undefined;
    }
    return rows;
}

async function logoutUser() {
    deleteDatabasePool();
}

export { createDatabasePool, createUser, loginUser, logoutUser, getUserVaults, createVault, getVaultEntries, createEntry, decryptEntry, getEntriesWithWebsite, deleteDatabasePool, getUser, validateUser };
