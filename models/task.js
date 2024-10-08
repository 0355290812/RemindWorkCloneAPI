const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: () => Date.now() + 7 * 24 * 60 * 60 * 1000
    },
    assigness: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        subTasks: [{
            title: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                required: true
            },
            dueDate: {
                type: Date,
            },
            completed: {
                type: Boolean,
                required: true,
                default: false
            }
        }]
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comment: {
            type: String,
            required: true
        },
        timestamps: {
            type: Date,
            required: true
        }
    }],
    log: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            required: true
        },
        timestamps: {
            type: Date,
            required: true
        }
    }],
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'paused', 'waiting-for-approval'],
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;