const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    player: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    enemy: {
        name: String,
        level: Number,
        hp: Number,
        attack: Number,
        defense: Number,
        magic: Number,
        agility: Number,
        gold: Number,
        exp: Number,
        currentHp: Number
    },
    type: {
        type: String,
        enum: ['monster', 'boss'],
        default: 'monster'
    },
    turn: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'fled'],
        default: 'active'
    },
    result: {
        type: String,
        enum: ['victory', 'defeat', 'fled'],
        default: null
    }
}, {
    timestamps: true
});

// Índices
battleSchema.index({ playerId: 1 });
battleSchema.index({ status: 1 });
battleSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 }); // Auto eliminar después de 1 hora

module.exports = mongoose.model('Battle', battleSchema);