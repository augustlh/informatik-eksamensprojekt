import crypto from 'crypto';


export function encrypt(data, password, salt){
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 24, (err, key) => {
            if (err) reject(err);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv("aes-192-cbc", key, iv)
            let encrypted = cipher.update(data, 'utf-8', 'hex')
            encrypted += cipher.final('hex')
            resolve({ iv: iv.toString('hex'), encryptedData: encrypted });
        });
    });
}

export function decrypt(encryptedData, password, iv, salt){
    const key = crypto.scryptSync(password, salt, 24)
    const decipher = crypto.createDecipheriv("aes-192-cbc", key, Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(encryptedData, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')
    return decrypted
}

export function hash(...args){
    const data = args.join(':');
    return crypto.createHash('sha256').update(data).digest('hex');    
}

export function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}
