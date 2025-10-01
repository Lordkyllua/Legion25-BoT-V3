const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    // Estadísticas base
    hp: {
        type: Number,
        default: 100
    },
    maxHp: {
        type: Number,
        default: 100
    },
    mp: {
        type: Number,
        default: 30
    },
    maxMp: {
        type: Number,
        default: 30
    },
    attack: {
        type: Number,
        default: 10
    },
    defense: {
        type: Number,
        default: 8
    },
    magic: {
        type: Number,
        default: 5
    },
    agility: {
        type: Number,
        default: 6
    },
    strength: {
        type: Number,
        default: 12
    },
    // Sistema de progresión
    class: {
        type: String,
        default: 'warrior',
        enum: ['warrior', 'mage', 'rogue']
    },
    level: {
        type: Number,
        default: 1
    },
    exp: {
        type: Number,
        default: 0
    },
    maxExp: {
        type: Number,
        default: 100
    },
    evolution: {
        type: String,
        default: 'Novice'
    },
    // Economía
    gold: {
        type: Number,
        default: 0
    },
    // Inventario
    inventory: [{
        itemId: String,
        name: String,
        type: String,
        quantity: {
            type: Number,
            default: 1
        },
        stats: mongoose.Schema.Types.Mixed
    }],
    // Equipo
    equipped: {
        weapon: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        armor: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        accessory: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    },
    // Habilidades
    skills: [{
        type: String
    }],
    // Progreso
    questsCompleted: {
        type: Number,
        default: 0
    },
    monstersDefeated: {
        type: Number,
        default: 0
    },
    // Estadísticas actuales en batalla
    currentHp: {
        type: Number,
        default: 100
    },
    currentMp: {
        type: Number,
        default: 30
    }
}, {
    timestamps: true
});

// Índices para mejor rendimiento
playerSchema.index({ userId: 1 });
playerSchema.index({ level: -1 });
playerSchema.index({ exp: -1 });

module.exports = mongoose.model('Player', playerSchema);