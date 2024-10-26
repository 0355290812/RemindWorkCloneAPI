const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { protect } = require('./utils/authUtils');
const database = require('./config/db');
const authRoutes = require('./routers/authRoutes');
const apiRoutes = require('./routers/apiRoutes');
const { confirmMember } = require('./controllers/projectController');
const app = express();
const path = require('path');
const { sendNotificationToMultipleUsers } = require('./utils/firebaseUtils');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

database.connect();

app.use('/auth', authRoutes);
app.use('/api', protect, apiRoutes);
app.get('/confirm/:token', confirmMember)
app.post('/push-notification', async (req, res) => {
    const { title, body } = req.body;

    const data = {
        type: 'notification',
        title: title || 'Default Title',
        body: body || 'Default Body',
    }

    tokens = ["eOcL9-NtQZ28q5kEmT13VM:APA91bHO8zr3GtqQv2wiyq2ePo6nVpQioXkdPamVNETY0Wj9oUKAaEJMybxbkeRjvNWeWw6fNbVJ_KIO9ScA3PLIecku59Ib6575adN472AVLkWz0zZgPCMCdgAtzLvr4kw02n_8oyUX"]

    if (!tokens || tokens.length === 0) {
        return res.status(400).json({ message: 'FCM tokens are required' });
    }

    const notificationPayload = {
        title: title || 'Default Title',
        body: body || 'Default Body',
    };

    try {
        await sendNotificationToMultipleUsers(tokens, notificationPayload, data || {});
        res.status(200).json({ message: 'Notifications sent successfully' });
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).json({ message: 'Failed to send notifications', error });
    }
});

module.exports = app;
