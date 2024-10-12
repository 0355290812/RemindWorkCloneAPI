const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
