const fs = require('fs');
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