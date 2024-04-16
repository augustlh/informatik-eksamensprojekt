// Ting til rapporten:
// Prepared statements -> Beskyttelse mod SQL injection

// Følgende pakker er nødvendige for at køre denne fil:
// npm install mysql2
// npm install dotenv

import mysql from "./node_modules/mysql2/index.js";
import dotenv from "./node_modules/dotenv/lib/main.js";

import { encrypt, decrypt, hash, generateSalt } from "./encryption.js";

dotenv.config();

let pool = null;

function createDatabasePool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });
}

function deleteDatabasePool() {
  if (pool) {
    pool.end();
    pool = null;
  }
}

async function createUser(name, email, password) {
  if (!pool) pool = createDatabasePool();
  const [existingUser] = await pool
    .promise()
    .query("SELECT * FROM users WHERE email = ?", [email]);

  if (existingUser.length > 0) {
    console.log("Email: " + email + " er allerede i brug");
    return null;
  }

  let salt = generateSalt();

  await pool
    .promise()
    .query(
      "INSERT INTO users (name, email, password, salt) VALUES (?, ?, ?, ?)",
      [name, email, hash(password, salt), salt]
    );
  console.log("Bruger oprettet");
  await createVault(await getUser(email), "default");
  return true;
}

async function getUser(email) {
  if (!pool) pool = createDatabasePool();
  const [rows] = await pool
    .promise()
    .query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
}

async function validateUser(email, password) {
  const user = await getUser(email);
  if (user && user.password === hash(password, user.salt)) {
    return user;
  }
  return null;
}

async function loginUser(email, password) {
  const user = await validateUser(email, password);
  if (user) {
    console.log("Succesfuld login for bruger: " + user.email);
    return user;
  } else {
    console.log("De indtastede oplysninger er forkerte");
    return 0;
  }
  deleteDatabasePool();
}

async function getUserVaults(user) {
  if (!pool) pool = createDatabasePool();
  const [rows] = await pool
    .promise()
    .query("SELECT * from vaults WHERE user_id = ? ", [user.id]);
  if (rows.length === 0) {
    return undefined;
  }
  return rows;
}

async function createVault(user, vault_name) {
  if (!pool) pool = createDatabasePool();
  const [existingVault] = await pool
    .promise()
    .query("SELECT * FROM vaults WHERE user_id = ? AND vault_name = ?", [
      user.id,
      vault_name,
    ]);

  if (existingVault.length > 0) {
    console.log(
      "Vault med navn " +
        vault_name +
        " eksisterer allerede for bruger " +
        user.email
    );
    return false;
  }
  console.log(user.id);

  await pool
    .promise()
    .query("INSERT INTO vaults (user_id, vault_name) VALUES (?, ?)", [
      user.id,
      vault_name,
    ]);
  console.log(
    "Vault oprettet for bruger: " + user.email + " med name " + vault_name
  );
  return true;
}

async function getVaultEntries(vault) {
  if (!pool) pool = createDatabasePool();
  const [rows] = await pool
    .promise()
    .query("SELECT * from entries WHERE vault_id = ? ", [vault.vault_id]);
  if (rows.length === 0) {
    return undefined;
  }
  return rows;
}

async function createEntry(vault, website, username, password, masterpassword) {
  if (!pool) pool = createDatabasePool();
  const [existingEntry] = await pool
    .promise()
    .query(
      "SELECT * FROM entries WHERE vault_id = ? AND website = ? AND username = ?",
      [vault.vault_id, website, username]
    );

  if (existingEntry.length > 0) {
    console.log(
      "Entry med website " +
        website +
        " og username " +
        username +
        " eksisterer allerede i vault " +
        vault.vault_id
    );
    return false;
  }

  const salt = generateSalt();
  const encryptedPassword = await encrypt(password, masterpassword, salt);
  await pool
    .promise()
    .query(
      "INSERT INTO entries (vault_id, website, username, password, iv, salt) VALUES (?, ?, ?, ?, ?, ?)",
      [
        vault.vault_id,
        website,
        username,
        encryptedPassword.encryptedData,
        encryptedPassword.iv,
        salt,
      ]
    );
  console.log(
    "Entry oprettet for vault: " +
      vault.vault_id +
      " med website " +
      website +
      " og username " +
      username
  );

  return true;
}

async function decryptEntry(entry, masterpassword) {
  const decryptedPassword = decrypt(
    entry.password,
    masterpassword,
    entry.iv,
    entry.salt
  );
  return decryptedPassword;
}

async function getEntriesWithWebsite(vault, website) {
  if (!pool) pool = createDatabasePool();
  const [rows] = await pool
    .promise()
    .query("SELECT * from entries WHERE vault_id = ? AND website = ?", [
      vault.vault_id,
      website,
    ]);
  if (rows.length === 0) {
    return undefined;
  }
  return rows;
}

async function logoutUser() {
  deleteDatabasePool();
}

export {
  createDatabasePool,
  createUser,
  loginUser,
  logoutUser,
  getUserVaults,
  createVault,
  getVaultEntries,
  createEntry,
  decryptEntry,
  getEntriesWithWebsite,
  deleteDatabasePool,
  getUser,
  validateUser,
};

await createUser("august", "august@gov.kr", "jeoneun");
let user = await loginUser("august@gov.kr", "jeoneun");

// let vaults = await getUserVaults(user)
// selectedVault = vaults[0]
// console.log(vaults)

// await createEntry(selectedVault, 'amazon.com', 'seojun', 'omegahemmeligadgangskode!', 'jeoneun')
// let entries = await getVaultEntries(selectedVault)
// console.log(entries)

// console.log("Decrypted password: " + await decryptEntry(entries[0], 'jeoneun'))

// ----- old stuff ------

// await createUser('frederik', "frederikhorup@kvindeelsker.dk", "1234")
// await createUser('vitus', "vitusbrodersen@gay.dk", "1234")
// await createUser('august', "august@gigachad.dk", "23sdasd")

// user = await loginUser('test@test.com', 'test')
// user = await loginUser('august@gigachad.dk', '23sdasd')
// console.log(user)

// let vaults = await getUserVaults(user)
// selectedVault = vaults[0] //Ændre den her til at correspond med hvilken en er aktiv på skærmen
// console.log(vaults)
// console.log(selectedVault)

// await createEntry(selectedVault, 'google.com', 'august', '1234', '23sdasd')

// let entries = await getVaultEntries(selectedVault)
// console.log(entries)

// console.log("Encrypted password: " + entries[0].password)
// let decryptedPassword = await decryptEntry(entries[0], '23sdasd')
// console.log("Decrypted password: " + decryptedPassword)

//deleteDatabasePool();

//export { createDatabasePool, createUser, loginUser, logoutUser, getUserVaults, createVault, getVaultEntries, createEntry, decryptEntry, getEntriesWithWebsite, deleteDatabasePool, getUser, validateUser };
