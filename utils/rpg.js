const User = require('../models/User');
const Gold = require('../models/Gold');

async function createCharacter(userId, className) {
    const baseStats = {
        mage: { 
            hp: 50, maxHp: 50, mp: 100, maxMp: 100, 
            attack: 5, defense: 3, magic: 15, agility: 6, intelligence: 12,
            class: 'mage', evolution: 'Apprentice'
        },
        warrior: { 
            hp: 100, maxHp: 100, mp: 30, maxMp: 30,
            attack: 12, defense: 10, magic: 2, agility: 4, strength: 14,
            class: 'warrior', evolution: 'Squire'
        },
        archer: { 
            hp: 70, maxHp: 70, mp: 60, maxMp: 60,
            attack: 10, defense: 5, magic: 4, agility: 12, dexterity: 13,
            class: 'archer', evolution: 'Hunter'
        }
    };

    const userData = {
        rpg: {
            ...baseStats[className],
            level: 1,
            exp: 0,
            maxExp: 100,
            inventory: [],
            equipped: {
                weapon: null,
                armor: null,
                accessory: null
            },
            skills: getStartingSkills(className),
            questsCompleted: 0,
            monstersDefeated: 0,
            createdAt: new Date()
        }
    };

    const user = await User.create(userId, userData);
    
    // Add starting gold
    await Gold.addGold(userId, 50);

    return user.rpg;
}

function getStartingSkills(className) {
    const skills = {
        mage: ['Fireball', 'Magic Shield'],
        warrior: ['Power Strike', 'Taunt'],
        archer: ['Quick Shot', 'Dodge']
    };
    return skills[className] || [];
}

async function addExperience(userId, exp) {
    const user = await User.findById(userId);
    if (!user || !user.rpg) return null;

    const rpg = user.rpg;
    rpg.exp += exp;
    let levelsGained = 0;
    
    // Check for level up
    while (rpg.exp >= rpg.maxExp && rpg.level < 100) {
        rpg.exp -= rpg.maxExp;
        rpg.level += 1;
        levelsGained++;
        rpg.maxExp = Math.floor(rpg.maxExp * 1.2);
        
        // Increase stats on level up
        rpg.maxHp += Math.floor(rpg.maxHp * 0.1);
        rpg.hp = rpg.maxHp; // Heal on level up
        
        if (rpg.class === 'mage') {
            rpg.maxMp += Math.floor(rpg.maxMp * 0.15);
            rpg.magic += 2;
            rpg.intelligence += 1;
        } else if (rpg.class === 'warrior') {
            rpg.attack += 2;
            rpg.defense += 1;
            if (rpg.strength) rpg.strength += 2;
        } else if (rpg.class === 'archer') {
            rpg.attack += 1;
            rpg.agility += 2;
            if (rpg.dexterity) rpg.dexterity += 2;
        }

        // Check for evolution
        checkEvolution(rpg);
        
        // Reward gold for level up
        const goldReward = rpg.level * 10;
        await Gold.addGold(userId, goldReward);
    }

    await User.updateRPG(userId, rpg);
    
    return {
        user: rpg,
        levelsGained: levelsGained,
        reachedMaxLevel: rpg.level >= 100
    };
}

function checkEvolution(rpg) {
    const evolutions = {
        mage: [
            { level: 1, name: 'Apprentice' },
            { level: 20, name: 'Wizard' },
            { level: 50, name: 'Archmage' },
            { level: 80, name: 'Mage Lord' }
        ],
        warrior: [
            { level: 1, name: 'Squire' },
            { level: 20, name: 'Knight' },
            { level: 50, name: 'Champion' },
            { level: 80, name: 'War Lord' }
        ],
        archer: [
            { level: 1, name: 'Hunter' },
            { level: 20, name: 'Ranger' },
            { level: 50, name: 'Sharpshooter' },
            { level: 80, name: 'Bow Master' }
        ]
    };

    const classEvolutions = evolutions[rpg.class];
    for (let i = classEvolutions.length - 1; i >= 0; i--) {
        if (rpg.level >= classEvolutions[i].level) {
            if (rpg.evolution !== classEvolutions[i].name) {
                rpg.evolution = classEvolutions[i].name;
                return classEvolutions[i].name;
            }
            break;
        }
    }
    return rpg.evolution;
}

async function getCharacter(userId) {
    const user = await User.findById(userId);
    return user ? user.rpg : null;
}

function calculateBattleRewards(monsterLevel) {
    const baseExp = monsterLevel * 10;
    const baseGold = monsterLevel * 5;
    
    const exp = Math.floor(baseExp * (0.8 + Math.random() * 0.4));
    const gold = Math.floor(baseGold * (0.8 + Math.random() * 0.4));
    
    return { exp, gold };
}

module.exports = {
    createCharacter,
    addExperience,
    getCharacter,
    calculateBattleRewards
};const fs = require('fs');
const path = require('path');

// Class system with evolutions
const classes = {
    warrior: {
        name: "Warrior",
        description: "A melee fighter with high resistance and physical damage.",
        baseStats: {
            health: 150,
            attack: 20,
            defense: 15,
            magic: 5,
            agility: 8
        }
    },
    mage: {
        name: "Mage", 
        description: "A powerful spellcaster with devastating magical damage.",
        baseStats: {
            health: 100,
            attack: 8,
            defense: 8,
            magic: 25,
            agility: 10
        }
    },
    archer: {
        name: "Archer",
        description: "A precise shooter with high mobility and ranged attacks.",
        baseStats: {
            health: 120,
            attack: 18,
            defense: 10,
            magic: 8,
            agility: 20
        }
    }
};

// Base skills
const baseSkills = {
    warrior: [
        { name: "Powerful Strike", level: 1 }
    ],
    mage: [
        { name: "Fireball", level: 1 }
    ],
    archer: [
        { name: "Quick Arrow", level: 1 }
    ]
};

// Item effects system
const applyItemEffects = (profile, item) => {
    if (!item.effect) return profile;
    
    const effects = item.effect.split(';');
    effects.forEach(effect => {
        const [type, value] = effect.split(':');
        switch (type) {
            case 'attack':
                profile.stats.attack += parseInt(value);
                break;
            case 'defense':
                profile.stats.defense += parseInt(value);
                break;
            case 'magic':
                profile.stats.magic += parseInt(value);
                break;
            case 'agility':
                profile.stats.agility += parseInt(value);
                break;
            case 'health':
                profile.maxHealth += parseInt(value);
                profile.health = profile.maxHealth;
                break;
        }
    });
    
    return profile;
};

// Remove item effects (when unequipping)
const removeItemEffects = (profile, item) => {
    if (!item.effect) return profile;
    
    const effects = item.effect.split(';');
    effects.forEach(effect => {
        const [type, value] = effect.split(':');
        switch (type) {
            case 'attack':
                profile.stats.attack -= parseInt(value);
                break;
            case 'defense':
                profile.stats.defense -= parseInt(value);
                break;
            case 'magic':
                profile.stats.magic -= parseInt(value);
                break;
            case 'agility':
                profile.stats.agility -= parseInt(value);
                break;
            case 'health':
                profile.maxHealth -= parseInt(value);
                profile.health = Math.min(profile.health, profile.maxHealth);
                break;
        }
    });
    
    return profile;
};

// Get user profile function
const getUserProfile = (userId) => {
    try {
        const databasePath = path.join(__dirname, '../database.json');
        if (!fs.existsSync(databasePath)) {
            fs.writeFileSync(databasePath, JSON.stringify({ users: {} }, null, 2));
        }
        
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        if (!database.users) database.users = {};
        
        if (database.users[userId] && database.users[userId].rpg) {
            return database.users[userId].rpg;
        }
        
        // Create default profile
        const defaultProfile = {
            level: 1,
            exp: 0,
            expToNextLevel: 100,
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            gold: 50,
            class: null,
            className: "Apprentice",
            evolution: null,
            evolutionLevel: 0,
            skills: ['Basic Attack'],
            equipment: {
                weapon: { id: 0, name: "None", type: "weapon" },
                armor: { id: 0, name: "Basic Clothes", type: "armor" },
                accessory: { id: 0, name: "None", type: "accessory" }
            },
            stats: {
                attack: 10,
                defense: 5,
                magic: 5,
                agility: 10
            },
            inventory: [],
            achievements: []
        };
        
        database.users[userId] = { rpg: defaultProfile };
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        
        return defaultProfile;
        
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        return {
            level: 1,
            exp: 0,
            expToNextLevel: 100,
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            gold: 50,
            class: null,
            className: "Apprentice",
            skills: ['Basic Attack'],
            equipment: {
                weapon: { id: 0, name: "None", type: "weapon" },
                armor: { id: 0, name: "Basic Clothes", type: "armor" },
                accessory: { id: 0, name: "None", type: "accessory" }
            },
            stats: {
                attack: 10,
                defense: 5,
                magic: 5,
                agility: 10
            },
            inventory: []
        };
    }
};

// Save profile function
const saveProfile = (userId, profile) => {
    try {
        const databasePath = path.join(__dirname, '../database.json');
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        if (!database.users) database.users = {};
        database.users[userId] = { rpg: profile };
        
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving profile:', error);
        return false;
    }
};

// Choose class function
const chooseClass = (userId, className) => {
    try {
        if (!classes[className]) {
            return { success: false, message: '❌ Invalid class. Available: warrior, mage, archer.' };
        }
        
        const profile = getUserProfile(userId);
        
        if (profile.class) {
            return { success: false, message: '❌ You already have a class.' };
        }
        
        const classInfo = classes[className];
        
        profile.class = className;
        profile.className = classInfo.name;
        profile.maxHealth = classInfo.baseStats.health;
        profile.health = classInfo.baseStats.health;
        profile.maxMana = 50 + (classInfo.baseStats.magic * 2);
        profile.mana = profile.maxMana;
        
        profile.stats.attack = classInfo.baseStats.attack;
        profile.stats.defense = classInfo.baseStats.defense;
        profile.stats.magic = classInfo.baseStats.magic;
        profile.stats.agility = classInfo.baseStats.agility;
        
        profile.skills = ['Basic Attack', ...baseSkills[className].map(skill => skill.name)];
        
        saveProfile(userId, profile);
        
        return { 
            success: true, 
            message: `🎉 You became a ${classInfo.name}!`,
            class: classInfo
        };
        
    } catch (error) {
        console.error('Error in chooseClass:', error);
        return { success: false, message: '❌ Error choosing class.' };
    }
};

// Buy item function - CORREGIDA para guardar en inventario
const buyItem = (userId, itemId) => {
    try {
        const storePath = path.join(__dirname, '../store.json');
        const storeData = fs.readFileSync(storePath, 'utf8');
        const store = JSON.parse(storeData);
        
        const item = store.items.find(i => i.id === itemId);
        if (!item) {
            return { success: false, message: '❌ Item not found.' };
        }
        
        const profile = getUserProfile(userId);
        
        // Check requirements
        if (profile.gold < item.price) {
            return { success: false, message: `❌ Not enough gold. Need ${item.price}, have ${profile.gold}.` };
        }
        
        if (item.requiredLevel && profile.level < item.requiredLevel) {
            return { success: false, message: `❌ Need level ${item.requiredLevel} for this item.` };
        }
        
        if (item.class !== 'all' && profile.class !== item.class) {
            return { success: false, message: `❌ This item is for ${item.class} class only.` };
        }
        
        // Deduct gold
        profile.gold -= item.price;
        
        // Add to inventory - CORREGIDO
        if (!profile.inventory) profile.inventory = [];
        profile.inventory.push({
            ...item,
            purchaseDate: new Date().toISOString(),
            equipped: false
        });
        
        // Save changes
        saveProfile(userId, profile);
        
        return { 
            success: true, 
            message: `✅ Purchased ${item.name} for ${item.price} gold!`,
            item: item
        };
        
    } catch (error) {
        console.error('Error in buyItem:', error);
        return { success: false, message: '❌ Error purchasing item.' };
    }
};

// Equip item function - NUEVA
const equipItem = (userId, itemId) => {
    try {
        const profile = getUserProfile(userId);
        
        if (!profile.inventory) {
            return { success: false, message: '❌ Your inventory is empty.' };
        }
        
        const itemIndex = profile.inventory.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            return { success: false, message: '❌ Item not found in your inventory.' };
        }
        
        const item = profile.inventory[itemIndex];
        
        // Check if item is already equipped
        if (item.equipped) {
            return { success: false, message: '❌ This item is already equipped.' };
        }
        
        // Check class restrictions
        if (item.class !== 'all' && profile.class !== item.class) {
            return { success: false, message: `❌ This item is for ${item.class} class only.` };
        }
        
        // Check level requirements
        if (item.requiredLevel && profile.level < item.requiredLevel) {
            return { success: false, message: `❌ Need level ${item.requiredLevel} to equip this.` };
        }
        
        // Unequip current item of same type
        const currentEquippedIndex = profile.inventory.findIndex(
            invItem => invItem.equipped && invItem.type === item.type
        );
        
        if (currentEquippedIndex !== -1) {
            const currentItem = profile.inventory[currentEquippedIndex];
            currentItem.equipped = false;
            removeItemEffects(profile, currentItem);
        }
        
        // Equip new item
        item.equipped = true;
        profile.equipment[item.type] = item;
        applyItemEffects(profile, item);
        
        // Save changes
        saveProfile(userId, profile);
        
        return { 
            success: true, 
            message: `✅ Equipped ${item.name}!`,
            item: item
        };
        
    } catch (error) {
        console.error('Error in equipItem:', error);
        return { success: false, message: '❌ Error equipping item.' };
    }
};

// Unequip item function - NUEVA
const unequipItem = (userId, itemType) => {
    try {
        const profile = getUserProfile(userId);
        
        const currentItem = profile.equipment[itemType];
        if (!currentItem || currentItem.id === 0) {
            return { success: false, message: `❌ No item equipped in ${itemType} slot.` };
        }
        
        // Find item in inventory
        const itemIndex = profile.inventory.findIndex(item => item.id === currentItem.id);
        if (itemIndex !== -1) {
            profile.inventory[itemIndex].equipped = false;
        }
        
        // Remove effects
        removeItemEffects(profile, currentItem);
        
        // Reset equipment slot
        profile.equipment[itemType] = { 
            id: 0, 
            name: itemType === 'weapon' ? 'None' : itemType === 'armor' ? 'Basic Clothes' : 'None',
            type: itemType 
        };
        
        // Save changes
        saveProfile(userId, profile);
        
        return { 
            success: true, 
            message: `✅ Unequipped ${currentItem.name}!`
        };
        
    } catch (error) {
        console.error('Error in unequipItem:', error);
        return { success: false, message: '❌ Error unequipping item.' };
    }
};

// Get inventory function - NUEVA
const getInventory = (userId) => {
    try {
        const profile = getUserProfile(userId);
        return {
            success: true,
            inventory: profile.inventory || [],
            equipment: profile.equipment
        };
    } catch (error) {
        console.error('Error in getInventory:', error);
        return { success: false, inventory: [], equipment: {} };
    }
};

// Add experience function
const addExperience = (userId, exp) => {
    try {
        const profile = getUserProfile(userId);
        profile.exp += exp;
        
        let leveledUp = false;
        let levelsGained = 0;
        
        while (profile.exp >= profile.expToNextLevel && profile.level < 100) {
            profile.exp -= profile.expToNextLevel;
            profile.level++;
            profile.expToNextLevel = Math.floor(profile.expToNextLevel * 1.1);
            leveledUp = true;
            levelsGained++;
        }
        
        saveProfile(userId, profile);
        
        return { 
            leveledUp, 
            levelsGained, 
            newLevel: profile.level,
            currentExp: profile.exp,
            nextLevelExp: profile.expToNextLevel
        };
        
    } catch (error) {
        console.error('Error in addExperience:', error);
        return { leveledUp: false, levelsGained: 0 };
    }
};

// Add gold function
const addGold = (userId, amount) => {
    try {
        const profile = getUserProfile(userId);
        profile.gold += amount;
        saveProfile(userId, profile);
        return profile.gold;
    } catch (error) {
        console.error('Error in addGold:', error);
        return 0;
    }
};

// Evolution functions (simplified)
const evolveClass = (userId, evolutionIndex) => {
    return { success: false, message: 'Evolution system coming soon!' };
};

const getAvailableEvolutions = (userId) => {
    return { success: false, availableEvolutions: {} };
};

module.exports = {
    getUserProfile,
    chooseClass,
    addExperience,
    addGold,
    buyItem,
    equipItem,
    unequipItem,
    getInventory,
    evolveClass,
    getAvailableEvolutions,
    classes,
    baseSkills
};