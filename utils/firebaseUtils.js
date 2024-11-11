const { admin, db } = require('../config/firebase');

const sendNotificationToMultipleUsers = async (deviceTokens, notificationPayload, dataPayload = {}) => {

    try {
        if (deviceTokens.length === 0) {
            console.log('No device tokens provided');
            return;
        }
        deviceTokens.forEach(async (token) => {
            token && await admin.messaging().send({
                token: token,
                notification: notificationPayload,
                data: dataPayload
            })
        })
    } catch (error) {
        console.log('Error sending notification', error);

    }
};

const sendNotificationFS = async (userName, body, avatar, to, activeLink) => {
    const notificationData = {
        userName: userName,
        body: body,
        avatar: avatar,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        to: to,
        isRead: false,
        activeLink: activeLink
    };

    try {
        await db.collection('notifications').add(notificationData);
        console.log('Notification added successfully');

    } catch (error) {
        console.error('Error adding notification: ', error);
    }
};

module.exports = { sendNotificationToMultipleUsers, sendNotificationFS };