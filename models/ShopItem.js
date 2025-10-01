const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['weapon', 'armor', 'potion', 'accessory', 'material'],
        required: true
    },
    category: {
        type: String,
        enum: ['warrior', 'mage', 'rogue', 'general'],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    stats: {
        hp: { type: Number, default: 0 },
        mp: { type: Number, default: 0 },
        attack: { type: Number, default: 0 },
        defense: { type: Number, default: 0 },
        magic: { type: Number, default: 0 },
        agility: { type: Number, default: 0 },
        strength: { type: Number, default: 0 }
    },
    requirements: {
        level: {
            type: Number,
            default: 1
        },
        class: {
            type: String,
            enum: ['warrior', 'mage', 'rogue', 'any'],
            default: 'any'
        }
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    stock: {
        type: Number,
        default: -1 // -1 para stock ilimitado
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices
shopItemSchema.index({ type: 1 });
shopItemSchema.index({ category: 1 });
shopItemSchema.index({ rarity: 1 });
shopItemSchema.index({ isActive: 1 });

module.exports = mongoose.model('ShopItem', shopItemSchema);