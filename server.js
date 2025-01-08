const fs = require('fs');
const https = require('https');
const http = require('http');
const dotenv = require('dotenv');
// const events = require('events');

dotenv.config();

const app = require('./app');
const port = process.env.PORT || 3001;
const httpsPort = process.env.HTTPS_PORT || 3002;

// events.EventEmitter.defaultMaxListeners = 10;

const privateKey = fs.readFileSync('private.key', 'utf8');
const certificate = fs.readFileSync('certificate.crt', 'utf8');

const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);
const httpServer = http.createServer(app);

httpsServer.listen(httpsPort, () => {
    console.log(`HTTPS Server running on port ${httpsPort}`);
});

httpServer.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
});