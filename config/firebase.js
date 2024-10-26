// firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Đường dẫn tới file serviceAccountKey

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
