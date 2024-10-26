const { admin, db } = require('../config/firebase');

const sendNotificationToMultipleUsers = async (deviceTokens, notificationPayload, dataPayload = {}) => {
    const messages = deviceTokens.map(token => ({
        token,
        notification: notificationPayload,
        data: dataPayload
    }));

    try {
        const response = await admin.messaging().sendEach(messages);
        console.log(`${response.successCount} notifications were sent successfully`);

        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(deviceTokens[idx]);
                }
            });
            console.log('Failed tokens:', failedTokens);
        }
    } catch (error) {
        console.error('Error sending notifications:', error);
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
    } catch (error) {
        console.error('Error adding notification: ', error);
    }
};

module.exports = { sendNotificationToMultipleUsers, sendNotificationFS };