const fs = require('fs');
const path = require('path');

// Class system with evolutions (English)
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
    },
    evolutions: {
      25: [
        {
          name: "Berserker",
          description: "Warrior focused on pure damage and battle fury",
          stats: { health: 50, attack: 30, defense: -5, magic: 0, agility: 10 },
          skills: ["Berserker Fury", "Bloody Strike"],
          special: "Increased critical attacks"
        },
        {
          name: "Paladin",
          description: "Holy warrior with defensive and healing abilities",
          stats: { health: 30, attack: 15, defense: 25, magic: 10, agility: 5 },
          skills: ["Divine Shield", "Healing Light"],
          special: "Resistance to dark magic"
        }
      ],
      50: [
        {
          name: "Dragon Knight",
          description: "Master of mounted combat with dragon allies",
          stats: { health: 100, attack: 40, defense: 30, magic: 15, agility: 20 },
          skills: ["Dragon Breath", "Epic Charge"],
          special: "Can summon dragon whelps"
        },
        {
          name: "War Titan",
          description: "Colossal warrior with superhuman strength",
          stats: { health: 150, attack: 45, defense: 35, magic: 5, agility: -10 },
          skills: ["Earthquake", "Titanic Strike"],
          special: "Immune to stuns"
        }
      ],
      75: [
        {
          name: "Warlord",
          description: "Legendary leader who commands entire armies",
          stats: { health: 200, attack: 60, defense: 40, magic: 20, agility: 15 },
          skills: ["Battle Cry", "Master Strategy"],
          special: "Increases group stats"
        },
        {
          name: "God of War",
          description: "Divine being with power to change the course of battles",
          stats: { health: 250, attack: 80, defense: 50, magic: 30, agility: 25 },
          skills: ["Final Judgment", "Summon Army"],
          special: "Unique divine abilities"
        }
      ]
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
    },
    evolutions: {
      25: [
        {
          name: "Elemental Sorcerer",
          description: "Mage who masters the four natural elements",
          stats: { health: 20, attack: 5, defense: 10, magic: 35, agility: 15 },
          skills: ["Elemental Storm", "Fire Shield"],
          special: "Bonus to elemental damage"
        },
        {
          name: "Necromancer",
          description: "Practitioner of dark magic and death manipulation",
          stats: { health: -20, attack: 10, defense: 5, magic: 40, agility: 10 },
          skills: ["Summon Skeletons", "Drain Life"],
          special: "Can revive allies"
        }
      ],
      50: [
        {
          name: "Archmage",
          description: "Mage of infinite knowledge and arcane power",
          stats: { health: 50, attack: 15, defense: 20, magic: 60, agility: 20 },
          skills: ["Meteor Shower", "Arcane Field"],
          special: "Fast mana regeneration"
        },
        {
          name: "Illusionist",
          description: "Master of deception and mental manipulation",
          stats: { health: 30, attack: 20, defense: 15, magic: 55, agility: 30 },
          skills: ["Mirage", "Mind Control"],
          special: "Can confuse enemies"
        }
      ],
      75: [
        {
          name: "Arcane Sage",
          description: "Being of pure knowledge who transcends conventional magic",
          stats: { health: 100, attack: 25, defense: 30, magic: 90, agility: 25 },
          skills: ["Reality Rewrite", "Eternal Wisdom"],
          special: "Can learn any spell"
        },
        {
          name: "God of Magic",
          description: "Deity who embodies magical power in its purest form",
          stats: { health: 150, attack: 30, defense: 40, magic: 120, agility: 35 },
          skills: ["Creation", "Annihilation"],
          special: "Infinite magic"
        }
      ]
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
    },
    evolutions: {
      25: [
        {
          name: "Hunter",
          description: "Expert in tracking and hunting powerful beasts",
          stats: { health: 30, attack: 25, defense: 10, magic: 5, agility: 25 },
          skills: ["Track", "Precise Shot"],
          special: "Bonus against beasts"
        },
        {
          name: "Assassin",
          description: "Specialist in quick and silent eliminations",
          stats: { health: 10, attack: 30, defense: 5, magic: 10, agility: 35 },
          skills: ["Lethal Blow", "Stealth"],
          special: "Increased critical damage"
        }
      ],
      50: [
        {
          name: "Elite Sniper",
          description: "Sniper with supernatural precision",
          stats: { health: 50, attack: 45, defense: 15, magic: 15, agility: 40 },
          skills: ["Long Distance Shot", "Perfect Aim"],
          special: "No minimum range"
        },
        {
          name: "Stalker",
          description: "Master of camouflage and surprise attacks",
          stats: { health: 40, attack: 40, defense: 20, magic: 20, agility: 45 },
          skills: ["Camouflage", "Ambush"],
          special: "Can move undetected"
        }
      ],
      75: [
        {
          name: "Legend of the Bow",
          description: "Hero whose arrows change the course of battles",
          stats: { health: 80, attack: 70, defense: 25, magic: 25, agility: 60 },
          skills: ["Arrow Rain", "Arrow of Victory"],
          special: "Arrows penetrate armor"
        },
        {
          name: "God of Archery",
          description: "Deity of precision and speed",
          stats: { health: 100, attack: 85, defense: 30, magic: 30, agility: 75 },
          skills: ["Divine Shot", "Supreme Speed"],
          special: "Can shoot multiple arrows"
        }
      ]
    }
  }
};

// Base skills in English
const baseSkills = {
  warrior: [
    { name: "Powerful Strike", level: 1, damage: 25, cost: 10 },
    { name: "Ultimate Sword", level: 5, damage: 45, cost: 20 },
    { name: "Warrior's Fury", level: 10, damage: 70, cost: 30 },
    { name: "Earthquake", level: 15, damage: 100, cost: 40 },
    { name: "War Cry", level: 20, damage: 130, cost: 50 }
  ],
  mage: [
    { name: "Fireball", level: 1, damage: 20, cost: 15 },
    { name: "Ice Ray", level: 5, damage: 35, cost: 25 },
    { name: "Arcane Storm", level: 10, damage: 60, cost: 35 },
    { name: "Meteor", level: 15, damage: 90, cost: 50 },
    { name: "Arcane Spell", level: 20, damage: 120, cost: 65 }
  ],
  archer: [
    { name: "Quick Arrow", level: 1, damage: 18, cost: 8 },
    { name: "Multiple Shot", level: 5, damage: 40, cost: 18 },
    { name: "Penetrating Arrow", level: 10, damage: 55, cost: 25 },
    { name: "Arrow Rain", level: 15, damage: 80, cost: 35 },
    { name: "Perfect Shot", level: 20, damage: 110, cost: 45 }
  ]
};

// Función para obtener el perfil del usuario - CORREGIDA
const getUserProfile = (userId) => {
    try {
        const databasePath = path.join(__dirname, '../database.json');
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        if (database.users && database.users[userId] && database.users[userId].rpg) {
            return database.users[userId].rpg;
        }
        
        // Default profile
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
        
        if (!database.users) database.users = {};
        if (!database.users[userId]) database.users[userId] = {};
        database.users[userId].rpg = defaultProfile;
        
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        return defaultProfile;
        
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        // Return default profile in case of error
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
    }
};

// Función para elegir clase - CORREGIDA
const chooseClass = (userId, className) => {
    try {
        if (!classes[className]) {
            return { success: false, message: '❌ Invalid class. Available classes: warrior, mage, archer.' };
        }
        
        const profile = getUserProfile(userId);
        
        if (profile.class) {
            return { success: false, message: '❌ You already have a class. You cannot change it.' };
        }
        
        const classInfo = classes[className];
        
        // Update profile with chosen class
        profile.class = className;
        profile.className = classInfo.name;
        profile.maxHealth = classInfo.baseStats.health;
        profile.health = classInfo.baseStats.health;
        profile.maxMana = 50 + (classInfo.baseStats.magic * 2);
        profile.mana = 50 + (classInfo.baseStats.magic * 2);
        
        // Update base statistics
        Object.keys(classInfo.baseStats).forEach(stat => {
            profile.stats[stat] = classInfo.baseStats[stat];
        });
        
        // Add class skills
        profile.skills = ['Basic Attack'].concat(
            baseSkills[className].filter(skill => skill.level === 1).map(skill => skill.name)
        );
        
        // Save changes
        saveProfile(userId, profile);
        
        return { 
            success: true, 
            message: `🎉 You have become a ${classInfo.name}!`,
            class: classInfo
        };
        
    } catch (error) {
        console.error('Error choosing class:', error);
        return { success: false, message: '❌ Error choosing class.' };
    }
};

// Función para evolucionar de clase - CORREGIDA
const evolveClass = (userId, evolutionIndex) => {
    try {
        const profile = getUserProfile(userId);
        
        if (!profile.class) {
            return { success: false, message: '❌ First choose a class with `/class`.' };
        }
        
        const classInfo = classes[profile.class];
        const currentLevel = profile.level;
        
        // Check available evolutions
        const availableEvolutions = Object.keys(classInfo.evolutions)
            .filter(evoLevel => currentLevel >= parseInt(evoLevel) && parseInt(evoLevel) > profile.evolutionLevel)
            .sort((a, b) => parseInt(a) - parseInt(b));
        
        if (availableEvolutions.length === 0) {
            return { success: false, message: '❌ No evolutions available. Keep leveling up.' };
        }
        
        const nextEvolutionLevel = availableEvolutions[0];
        const evolutionOptions = classInfo.evolutions[nextEvolutionLevel];
        
        if (evolutionIndex < 0 || evolutionIndex >= evolutionOptions.length) {
            return { success: false, message: '❌ Invalid evolution option.' };
        }
        
        const chosenEvolution = evolutionOptions[evolutionIndex];
        
        // Apply evolution
        profile.evolution = chosenEvolution.name;
        profile.className = chosenEvolution.name;
        profile.evolutionLevel = parseInt(nextEvolutionLevel);
        
        // Apply stat bonuses
        Object.keys(chosenEvolution.stats).forEach(stat => {
            if (stat === 'health') {
                profile.maxHealth += chosenEvolution.stats[stat];
                profile.health = profile.maxHealth;
            } else {
                profile.stats[stat] += chosenEvolution.stats[stat];
            }
        });
        
        // Add new skills
        chosenEvolution.skills.forEach(skill => {
            if (!profile.skills.includes(skill)) {
                profile.skills.push(skill);
            }
        });
        
        // Add achievement
        if (!profile.achievements) profile.achievements = [];
        profile.achievements.push(`Evolved to ${chosenEvolution.name} (Level ${nextEvolutionLevel})`);
        
        saveProfile(userId, profile);
        
        return { 
            success: true, 
            message: `🎉 You have evolved to ${chosenEvolution.name}!`,
            evolution: chosenEvolution,
            level: nextEvolutionLevel
        };
        
    } catch (error) {
        console.error('Error evolving class:', error);
        return { success: false, message: '❌ Error evolving.' };
    }
};

// Función para ver evoluciones disponibles - CORREGIDA
const getAvailableEvolutions = (userId) => {
    try {
        const profile = getUserProfile(userId);
        
        if (!profile.class) {
            return { success: false, message: 'First choose a class.' };
        }
        
        const classInfo = classes[profile.class];
        const currentLevel = profile.level;
        
        const availableEvolutions = {};
        
        Object.keys(classInfo.evolutions).forEach(evoLevel => {
            if (currentLevel >= parseInt(evoLevel) && parseInt(evoLevel) > profile.evolutionLevel) {
                availableEvolutions[evoLevel] = classInfo.evolutions[evoLevel];
            }
        });
        
        return { 
            success: true, 
            availableEvolutions,
            currentEvolutionLevel: profile.evolutionLevel,
            hasEvolutions: Object.keys(availableEvolutions).length > 0
        };
        
    } catch (error) {
        console.error('Error getting evolutions:', error);
        return { success: false, availableEvolutions: {} };
    }
};

// Función para agregar experiencia - CORREGIDA
const addExperience = (userId, exp) => {
    try {
        const profile = getUserProfile(userId);
        profile.exp += exp;
        
        let leveledUp = false;
        let levelsGained = 0;
        let newSkills = [];
        
        // Check if level up (max level 100)
        while (profile.exp >= profile.expToNextLevel && profile.level < 100) {
            profile.exp -= profile.expToNextLevel;
            profile.level++;
            
            // Calculate EXP for next level (increases progressively)
            profile.expToNextLevel = Math.floor(100 * Math.pow(1.1, profile.level - 1));
            
            // Improve statistics according to class
            if (profile.class) {
                const classInfo = classes[profile.class];
                const statMultiplier = 1 + (profile.level * 0.02);
                
                profile.maxHealth = Math.floor(classInfo.baseStats.health * statMultiplier);
                if (profile.evolution) {
                    const evolutionBonus = classInfo.evolutions[profile.evolutionLevel]?.find(e => e.name === profile.evolution)?.stats.health || 0;
                    profile.maxHealth += evolutionBonus;
                }
                profile.health = profile.maxHealth;
                
                profile.maxMana = Math.floor((50 + (classInfo.baseStats.magic * 2)) * statMultiplier);
                profile.mana = profile.maxMana;
                
                // Improve base statistics
                Object.keys(classInfo.baseStats).forEach(stat => {
                    if (stat !== 'health') {
                        profile.stats[stat] = Math.floor(classInfo.baseStats[stat] * statMultiplier);
                    }
                });
                
                // Learn new skills according to level
                const availableSkills = baseSkills[profile.class].filter(skill => 
                    skill.level === profile.level && 
                    !profile.skills.includes(skill.name)
                );
                
                if (availableSkills.length > 0) {
                    availableSkills.forEach(skill => {
                        profile.skills.push(skill.name);
                        newSkills.push(skill.name);
                    });
                }
            }
            
            leveledUp = true;
            levelsGained++;
            
            // If reached max level
            if (profile.level >= 100) {
                profile.exp = 0;
                profile.expToNextLevel = 0;
                if (!profile.achievements) profile.achievements = [];
                profile.achievements.push("Maximum Level 100 Reached!");
                break;
            }
        }
        
        saveProfile(userId, profile);
        
        return { 
            leveledUp, 
            levelsGained, 
            newLevel: profile.level,
            currentExp: profile.exp,
            nextLevelExp: profile.expToNextLevel,
            newSkills,
            maxLevelReached: profile.level >= 100
        };
        
    } catch (error) {
        console.error('Error in addExperience:', error);
        return { leveledUp: false, levelsGained: 0, newLevel: 1, newSkills: [] };
    }
};

// Función para agregar oro - CORREGIDA
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

// Función para comprar items con oro - CORREGIDA
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
        
        // Check if user has enough gold
        if (profile.gold < item.price) {
            return { success: false, message: `❌ You don't have enough gold. You need ${item.price} but have ${profile.gold}.` };
        }
        
        // Check level and class requirements
        if (item.requiredLevel && profile.level < item.requiredLevel) {
            return { success: false, message: `❌ You need level ${item.requiredLevel} to buy this item.` };
        }
        
        if (item.class !== 'all' && profile.class !== item.class) {
            return { success: false, message: `❌ This item is only for ${item.class} class.` };
        }
        
        // Subtract gold
        profile.gold -= item.price;
        
        // Add item to inventory
        if (!profile.inventory) profile.inventory = [];
        profile.inventory.push(item);
        
        saveProfile(userId, profile);
        
        return { success: true, message: `✅ You bought ${item.name} for ${item.price} gold!`, item };
        
    } catch (error) {
        console.error('Error buying item:', error);
        return { success: false, message: '❌ Error buying the item.' };
    }
};

// Función auxiliar para guardar perfil - CORREGIDA
const saveProfile = (userId, profile) => {
    try {
        const databasePath = path.join(__dirname, '../database.json');
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        if (!database.users) database.users = {};
        if (!database.users[userId]) database.users[userId] = {};
        database.users[userId].rpg = profile;
        
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving profile:', error);
        return false;
    }
};

// EXPORTACIÓN CORREGIDA - usando funciones const
module.exports = {
    getUserProfile,
    chooseClass,
    evolveClass,
    getAvailableEvolutions,
    addExperience,
    addGold,
    buyItem,
    classes,
    baseSkills
};