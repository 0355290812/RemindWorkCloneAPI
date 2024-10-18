const mongoose = require('mongoose');
const Task = require('./task');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: ['admin', 'teamlead', 'employee'],
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;