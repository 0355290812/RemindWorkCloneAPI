const mongoose = require('mongoose');

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('Database connected');
    } catch (error) {
        console.log('Error connecting to database');
        console.log(error);
    }
}

module.exports = { connect };