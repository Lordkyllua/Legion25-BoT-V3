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

// Nueva función para completar quests
async function completeQuest(userId, exp, gold) {
    try {
        const user = await User.findById(userId);
        if (!user || !user.rpg) return null;

        // Add experience and gold
        const levelUp = await addExperience(userId, exp);
        await Gold.addGold(userId, gold);

        // Update quest statistics
        user.rpg.questsCompleted = (user.rpg.questsCompleted || 0) + 1;
        await User.updateRPG(userId, user.rpg);

        return {
            levelUp: levelUp,
            questsCompleted: user.rpg.questsCompleted,
            rewards: { exp, gold }
        };
    } catch (error) {
        console.error('Error completing quest:', error);
        throw error;
    }
}

module.exports = {
    createCharacter,
    addExperience,
    getCharacter,
    calculateBattleRewards,
    completeQuest
};