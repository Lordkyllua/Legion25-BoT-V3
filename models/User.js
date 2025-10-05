const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    username: { type: String, required: true },
    
    // RPG Stats
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    gold: { type: Number, default: 100 },
    health: { type: Number, default: 100 },
    maxHealth: { type: Number, default: 100 },
    mana: { type: Number, default: 50 },
    maxMana: { type: Number, default: 50 },
    
    // Class System
    class: { type: String, default: 'Novice' },
    evolution: { type: Number, default: 0 }, // 0: Base, 1: First evolution, 2: Second evolution
    
    // Stats
    strength: { type: Number, default: 5 },
    intelligence: { type: Number, default: 5 },
    agility: { type: Number, default: 5 },
    defense: { type: Number, default: 5 },
    
    // Equipment
    equipment: {
        weapon: { type: String, default: null },
        armor: { type: String, default: null },
        accessory: { type: String, default: null }
    },
    
    // Inventory
    inventory: [{
        itemId: String,
        quantity: Number,
        equipped: Boolean
    }],
    
    // Skills
    skills: [{
        name: String,
        level: Number,
        type: String
    }],
    
    // Quests & Combat
    activeQuest: { type: String, default: null },
    questProgress: { type: Number, default: 0 },
    dailyQuests: { type: Number, default: 0 },
    lastQuest: { type: Date, default: null },
    monstersDefeated: { type: Number, default: 0 },
    bossesDefeated: { type: Number, default: 0 },
    
    // Cooldowns
    cooldowns: {
        quest: { type: Date, default: null },
        fight: { type: Date, default: null }
    }
}, { timestamps: true });

userSchema.methods.addExp = function(amount) {
    this.exp += amount;
    const expNeeded = this.level * 100;
    if (this.exp >= expNeeded) {
        this.level += 1;
        this.exp -= expNeeded;
        this.maxHealth += 10;
        this.health = this.maxHealth;
        this.maxMana += 5;
        this.mana = this.maxMana;
        return true; // Level up
    }
    return false; // No level up
};

userSchema.methods.addGold = function(amount) {
    this.gold += amount;
};

userSchema.methods.canEvolve = function() {
    const evolutionLevels = { 1: 20, 2: 50 };
    return this.level >= evolutionLevels[this.evolution + 1];
};

module.exports = mongoose.model('User', userSchema);