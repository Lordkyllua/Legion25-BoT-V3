const path = require('path');

// Class system
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

// Data management functions using the new system
const getUsersData = () => {
    try {
        if (global.client && global.client.dataManager) {
            return global.client.dataManager.getData('users.json') || {};
        }
        // Fallback for testing
        const fs = require('fs');
        const dataPath = path.join(__dirname, '../data/users.json');
        if (fs.existsSync(dataPath)) {
            return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }
        return {};
    } catch (error) {
        console.error('Error reading users data:', error);
        return {};
    }
};

const saveUsersData = (data) => {
    try {
        if (global.client && global.client.dataManager) {
            return global.client.dataManager.saveData('users.json', data);
        }
        // Fallback for testing
        const fs = require('fs');
        const dataPath = path.join(__dirname, '../data/users.json');
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users data:', error);
        return false;
    }
};

const getPointsData = () => {
    try {
        if (global.client && global.client.dataManager) {
            return global.client.dataManager.getData('points.json') || {};
        }
        // Fallback
        const fs = require('fs');
        const dataPath = path.join(__dirname, '../data/points.json');
        if (fs.existsSync(dataPath)) {
            return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }
        return {};
    } catch (error) {
        console.error('Error reading points data:', error);
        return {};
    }
};

const savePointsData = (data) => {
    try {
        if (global.client && global.client.dataManager) {
            return global.client.dataManager.saveData('points.json', data);
        }
        // Fallback
        const fs = require('fs');
        const dataPath = path.join(__dirname, '../data/points.json');
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving points data:', error);
        return false;
    }
};

// Enhanced user profile functions
const getUserProfile = (userId) => {
    try {
        const usersData = getUsersData();
        
        if (usersData[userId] && usersData[userId].rpg) {
            return usersData[userId].rpg;
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
            achievements: [],
            lastDaily: null,
            dailyStreak: 0,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        
        // Save default profile
        if (!usersData[userId]) usersData[userId] = {};
        usersData[userId].rpg = defaultProfile;
        usersData[userId].lastActive = new Date().toISOString();
        
        saveUsersData(usersData);
        
        return defaultProfile;
        
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        return getDefaultProfile();
    }
};

const getDefaultProfile = () => {
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
};

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
        const usersData = getUsersData();
        
        // Update profile with class
        profile.class = className;
        profile.className = classInfo.name;
        profile.maxHealth = classInfo.baseStats.health;
        profile.health = classInfo.baseStats.health;
        profile.maxMana = 50 + (classInfo.baseStats.magic * 2);
        profile.mana = profile.maxMana;
        profile.lastActive = new Date().toISOString();
        
        // Update stats
        profile.stats.attack = classInfo.baseStats.attack;
        profile.stats.defense = classInfo.baseStats.defense;
        profile.stats.magic = classInfo.baseStats.magic;
        profile.stats.agility = classInfo.baseStats.agility;
        
        // Add class skills
        profile.skills = ['Basic Attack', ...baseSkills[className].map(skill => skill.name)];
        
        // Save to database
        usersData[userId] = { 
            ...usersData[userId],
            rpg: profile,
            lastActive: new Date().toISOString()
        };
        
        const saveResult = saveUsersData(usersData);
        
        if (!saveResult) {
            return { success: false, message: '❌ Error saving your class choice.' };
        }
        
        return { 
            success: true, 
            message: `🎉 You became a ${classInfo.name}!`,
            class: classInfo
        };
        
    } catch (error) {
        console.error('Error choosing class:', error);
        return { success: false, message: '❌ Error choosing class.' };
    }
};

const addExperience = (userId, exp) => {
    try {
        const usersData = getUsersData();
        const profile = getUserProfile(userId);
        
        profile.exp += exp;
        profile.lastActive = new Date().toISOString();
        
        let leveledUp = false;
        let levelsGained = 0;
        let newSkills = [];
        
        // Level up system
        while (profile.exp >= profile.expToNextLevel && profile.level < 100) {
            profile.exp -= profile.expToNextLevel;
            profile.level++;
            profile.expToNextLevel = Math.floor(100 * Math.pow(1.1, profile.level - 1));
            leveledUp = true;
            levelsGained++;
        }
        
        // Update user data
        usersData[userId] = { 
            ...usersData[userId],
            rpg: profile,
            lastActive: new Date().toISOString()
        };
        
        saveUsersData(usersData);
        
        return { 
            leveledUp, 
            levelsGained, 
            newLevel: profile.level,
            currentExp: profile.exp,
            nextLevelExp: profile.expToNextLevel,
            newSkills 
        };
        
    } catch (error) {
        console.error('Error in addExperience:', error);
        return { leveledUp: false, levelsGained: 0 };
    }
};

const addGold = (userId, amount) => {
    try {
        const usersData = getUsersData();
        const profile = getUserProfile(userId);
        
        profile.gold += amount;
        profile.lastActive = new Date().toISOString();
        
        usersData[userId] = { 
            ...usersData[userId],
            rpg: profile,
            lastActive: new Date().toISOString()
        };
        
        saveUsersData(usersData);
        return profile.gold;
        
    } catch (error) {
        console.error('Error in addGold:', error);
        return 0;
    }
};

const getPoints = (userId) => {
    try {
        const pointsData = getPointsData();
        return pointsData[userId] || 0;
    } catch (error) {
        console.error('Error getting points:', error);
        return 0;
    }
};

const addPoints = (userId, amount) => {
    try {
        const pointsData = getPointsData();
        pointsData[userId] = (pointsData[userId] || 0) + amount;
        
        savePointsData(pointsData);
        return pointsData[userId];
    } catch (error) {
        console.error('Error adding points:', error);
        return 0;
    }
};

const removePoints = (userId, amount) => {
    try {
        const pointsData = getPointsData();
        pointsData[userId] = Math.max((pointsData[userId] || 0) - amount, 0);
        
        savePointsData(pointsData);
        return pointsData[userId];
    } catch (error) {
        console.error('Error removing points:', error);
        return 0;
    }
};

const buyItem = (userId, itemId) => {
    try {
        // Get store data
        let storeData;
        if (global.client && global.client.dataManager) {
            storeData = global.client.dataManager.getData('store.json');
        } else {
            const fs = require('fs');
            const storePath = path.join(__dirname, '../data/store.json');
            storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
        }
        
        const item = storeData.items.find(i => i.id === itemId);
        if (!item) {
            return { success: false, message: '❌ Item not found.' };
        }
        
        const usersData = getUsersData();
        const profile = getUserProfile(userId);
        
        if (profile.gold < item.price) {
            return { success: false, message: `❌ Not enough gold. Need ${item.price}, have ${profile.gold}.` };
        }
        
        profile.gold -= item.price;
        profile.lastActive = new Date().toISOString();
        
        if (!profile.inventory) profile.inventory = [];
        profile.inventory.push({
            id: item.id,
            name: item.name,
            type: item.type,
            category: item.category,
            description: item.description,
            purchasedAt: new Date().toISOString()
        });
        
        usersData[userId] = { 
            ...usersData[userId],
            rpg: profile,
            lastActive: new Date().toISOString()
        };
        
        saveUsersData(usersData);
        
        return { success: true, message: `✅ Bought ${item.name} for ${item.price} gold!`, item };
        
    } catch (error) {
        console.error('Error buying item:', error);
        return { success: false, message: '❌ Error buying item.' };
    }
};

// Export all functions
module.exports = {
    getUserProfile,
    chooseClass,
    addExperience,
    addGold,
    getPoints,
    addPoints,
    removePoints,
    buyItem,
    classes,
    baseSkills
};