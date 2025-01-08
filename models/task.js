const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const dotenv = require('dotenv');

dotenv.config();

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
            },
            toggleAt: {
                type: Date,
                required: true
            },
            toggleBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
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
    },
    isImportant: {
        type: Boolean,
        default: false
    },
    files: [{
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    }],
}, { timestamps: true });

const encKey = process.env.ENCRYPTION_KEY;
const sigKey = process.env.SIGNING_KEY;

if (!encKey || !sigKey) {
    throw new Error('Encryption and signing keys are required');
}

taskSchema.plugin(encrypt, {
    encryptionKey: encKey,
    signingKey: sigKey,
    encryptedFields: ['title', 'description']
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;