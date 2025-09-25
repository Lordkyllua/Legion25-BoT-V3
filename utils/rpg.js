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

// Get user profile function
const getUserProfile = (userId) => {
    try {
        // Ensure database file exists
        const databasePath = path.join(__dirname, '../database.json');
        if (!fs.existsSync(databasePath)) {
            fs.writeFileSync(databasePath, JSON.stringify({ users: {} }, null, 2));
        }
        
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        // Initialize database structure if needed
        if (!database.users) database.users = {};
        
        // Return existing profile or create default one
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
                weapon: 'None',
                armor: 'Basic Clothes',
                accessory: 'None'
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
        
        // Save default profile
        database.users[userId] = { rpg: defaultProfile };
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        
        return defaultProfile;
        
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        // Return safe default profile
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
                weapon: 'None',
                armor: 'Basic Clothes',
                accessory: 'None'
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

// Choose class function
const chooseClass = (userId, className) => {
    try {
        console.log(`Choosing class ${className} for user ${userId}`);
        
        if (!classes[className]) {
            return { success: false, message: '❌ Invalid class. Available: warrior, mage, archer.' };
        }
        
        const profile = getUserProfile(userId);
        
        if (profile.class) {
            return { success: false, message: '❌ You already have a class.' };
        }
        
        const classInfo = classes[className];
        
        // Update profile with class
        profile.class = className;
        profile.className = classInfo.name;
        profile.maxHealth = classInfo.baseStats.health;
        profile.health = classInfo.baseStats.health;
        profile.maxMana = 50 + (classInfo.baseStats.magic * 2);
        profile.mana = profile.maxMana;
        
        // Update stats
        profile.stats.attack = classInfo.baseStats.attack;
        profile.stats.defense = classInfo.baseStats.defense;
        profile.stats.magic = classInfo.baseStats.magic;
        profile.stats.agility = classInfo.baseStats.agility;
        
        // Add class skills
        profile.skills = ['Basic Attack', ...baseSkills[className].map(skill => skill.name)];
        
        // Save to database
        const databasePath = path.join(__dirname, '../database.json');
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        if (!database.users) database.users = {};
        database.users[userId] = { rpg: profile };
        
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        
        console.log(`Class ${className} assigned successfully to user ${userId}`);
        
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

// Add experience function
const addExperience = (userId, exp) => {
    try {
        const profile = getUserProfile(userId);
        profile.exp += exp;
        
        let leveledUp = false;
        let levelsGained = 0;
        
        // Simple level up system
        while (profile.exp >= profile.expToNextLevel && profile.level < 100) {
            profile.exp -= profile.expToNextLevel;
            profile.level++;
            profile.expToNextLevel = Math.floor(profile.expToNextLevel * 1.1);
            leveledUp = true;
            levelsGained++;
        }
        
        // Save changes
        const databasePath = path.join(__dirname, '../database.json');
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        if (!database.users) database.users = {};
        database.users[userId] = { rpg: profile };
        
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        
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
        
        const databasePath = path.join(__dirname, '../database.json');
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        if (!database.users) database.users = {};
        database.users[userId] = { rpg: profile };
        
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        
        return profile.gold;
        
    } catch (error) {
        console.error('Error in addGold:', error);
        return 0;
    }
};

// Buy item function
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
        
        if (profile.gold < item.price) {
            return { success: false, message: `❌ Not enough gold. Need ${item.price}, have ${profile.gold}.` };
        }
        
        profile.gold -= item.price;
        
        if (!profile.inventory) profile.inventory = [];
        profile.inventory.push(item);
        
        // Save changes
        const databasePath = path.join(__dirname, '../database.json');
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        if (!database.users) database.users = {};
        database.users[userId] = { rpg: profile };
        
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        
        return { success: true, message: `✅ Bought ${item.name} for ${item.price} gold!`, item };
        
    } catch (error) {
        console.error('Error in buyItem:', error);
        return { success: false, message: '❌ Error buying item.' };
    }
};

// Evolution functions (simplified for now)
const evolveClass = (userId, evolutionIndex) => {
    return { success: false, message: 'Evolution system coming soon!' };
};

const getAvailableEvolutions = (userId) => {
    return { success: false, availableEvolutions: {} };
};

// Export all functions correctly
module.exports = {
    getUserProfile,
    chooseClass,
    addExperience,
    addGold,
    buyItem,
    evolveClass,
    getAvailableEvolutions,
    classes,
    baseSkills
};