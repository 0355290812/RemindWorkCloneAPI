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
    // task: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Task'
    // }],
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
        }
    }]
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;