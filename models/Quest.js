const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    reward: {
        exp: Number,
        gold: Number,
        items: [{
            itemId: String,
            name: String,
            quantity: Number
        }]
    },
    requirements: {
        minLevel: {
            type: Number,
            default: 1
        },
        maxLevel: {
            type: Number,
            default: null
        }
    },
    status: {
        type: String,
        enum: ['available', 'in-progress', 'completed', 'failed'],
        default: 'available'
    },
    progress: {
        current: {
            type: Number,
            default: 0
        },
        target: {
            type: Number,
            default: 1
        }
    },
    startedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Índices
questSchema.index({ playerId: 1 });
questSchema.index({ status: 1 });
questSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Quest', questSchema);