import crypto from 'crypto';

/**
 * Encrypts data using a password and a salt
 * @param {string} data - The data to encrypt
 * @param {string} password - The password to use
 * @param {string} salt - The salt to use
 * @returns {Promise} - A promise that resolves to an object containing the iv and the encrypted data
 */
export function encrypt(data, password, salt){
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 24, (err, key) => {
            if (err) reject(err);
            //Generates a random initialization vector
            const iv = crypto.randomBytes(16);
            //Creates a cipher object
            const cipher = crypto.createCipheriv("aes-192-cbc", key, iv)
            //Encrypts the data
            let encrypted = cipher.update(data, 'utf-8', 'hex')
            encrypted += cipher.final('hex')
            //Resolves the promise with the iv and the encrypted data
            resolve({ iv: iv.toString('hex'), encryptedData: encrypted });
        });
    });
}

/**
 * Decrypts data using a password, an iv and a salt
 * @param {string} encryptedData - The data to decrypt
 * @param {string} password - The password to use
 * @param {string} iv - The iv to use
 * @param {string} salt - The salt to use
 * @returns {string} - The decrypted data
 */
export function decrypt(encryptedData, password, iv, salt){
    //Generates the key using the password and the salt
    const key = crypto.scryptSync(password, salt, 24)
    //Creates a decipher object
    const decipher = crypto.createDecipheriv("aes-192-cbc", key, Buffer.from(iv, 'hex'))
    //Decrypts the data
    let decrypted = decipher.update(encryptedData, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')
    return decrypted
}

/**
 * Hashes the input arguments
 * @param  {...any} args - The arguments to hash
 * @returns {string} - The hashed data
 */
export function hash(...args){
    //Joins the arguments into a single string
    const data = args.join(':');
    //Creates a hash using the sha256 algorithm and returns it as a hexadecimal string
    return crypto.createHash('sha256').update(data).digest('hex');    
}

/**
 * Generates a random salt using crypto.randomBytes 
 * @returns {string} - A random salt
 
 */
export function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

export function generatePassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzæøåABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ÆØÅ*!@#$%^&()_-+=<>?/{}[]|~";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}