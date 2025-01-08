const crypto = require('crypto');

const generateEncryptionKey = () => {
    return crypto.randomBytes(32).toString('base64');
};

const generateSigningKey = () => {
    return crypto.randomBytes(64).toString('base64');
};

const encryptionKey = generateEncryptionKey();
const signingKey = generateSigningKey();

