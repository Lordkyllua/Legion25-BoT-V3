const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true, enum: ['weapon', 'armor', 'potion', 'accessory', 'material'] },
    rarity: { type: String, required: true, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] },
    levelRequirement: { type: Number, default: 1 },
    classRequirement: { type: String, default: null },
    
    // Stats
    strength: { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
    agility: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    mana: { type: Number, default: 0 },
    
    // Combat
    damage: { type: Number, default: 0 },
    criticalChance: { type: Number, default: 0 },
    
    // Shop
    price: { type: Number, required: true },
    sellPrice: { type: Number, default: 0 },
    stackable: { type: Boolean, default: false },
    
    // Usage
    consumable: { type: Boolean, default: false },
    effect: { type: String, default: null },
    duration: { type: Number, default: 0 }
});

module.exports = mongoose.model('Item', itemSchema);