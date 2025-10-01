const { Player } = require('../models/Player');
const { Battle } = require('../models/Battle');
const { Quest } = require('../models/Quest');
const { ShopItem } = require('../models/ShopItem');

class RPGUtils {
    static async createCharacter(userId, username, className = 'warrior') {
        try {
            const baseStats = this.getClassStats(className);
            
            const player = new Player({
                userId,
                username,
                class: className,
                ...baseStats
            });

            await player.save();
            return player;
        } catch (error) {
            console.error('Error creating character:', error);
            throw error;
        }
    }

    static getClassStats(className) {
        const classes = {
            warrior: {
                hp: 100,
                maxHp: 100,
                mp: 30,
                maxMp: 30,
                attack: 12,
                defense: 10,
                magic: 2,
                agility: 4,
                strength: 14,
                level: 1,
                exp: 0,
                maxExp: 100,
                evolution: 'Squire',
                skills: ['Power Strike', 'Taunt']
            },
            mage: {
                hp: 80,
                maxHp: 80,
                mp: 50,
                maxMp: 50,
                attack: 8,
                defense: 6,
                magic: 15,
                agility: 3,
                strength: 8,
                level: 1,
                exp: 0,
                maxExp: 100,
                evolution: 'Apprentice',
                skills: ['Fireball', 'Heal']
            },
            rogue: {
                hp: 90,
                maxHp: 90,
                mp: 25,
                maxMp: 25,
                attack: 14,
                defense: 8,
                magic: 4,
                agility: 12,
                strength: 10,
                level: 1,
                exp: 0,
                maxExp: 100,
                evolution: 'Scout',
                skills: ['Backstab', 'Dodge']
            }
        };

        return classes[className] || classes.warrior;
    }

    static async addExperience(player, exp) {
        try {
            player.exp += exp;
            
            while (player.exp >= player.maxExp) {
                player.exp -= player.maxExp;
                player.level += 1;
                player.maxExp = Math.floor(player.maxExp * 1.5);
                
                // Mejorar estadísticas al subir de nivel
                this.levelUpStats(player);
                
                // Verificar evolución
                this.checkEvolution(player);
            }
            
            await player.save();
            return player;
        } catch (error) {
            console.error('Error adding experience:', error);
            throw error;
        }
    }

    static levelUpStats(player) {
        const statIncreases = {
            warrior: {
                hp: 10,
                maxHp: 10,
                mp: 5,
                maxMp: 5,
                attack: 2,
                defense: 2,
                magic: 0.5,
                agility: 1,
                strength: 3
            },
            mage: {
                hp: 6,
                maxHp: 6,
                mp: 10,
                maxMp: 10,
                attack: 1,
                defense: 1,
                magic: 3,
                agility: 0.5,
                strength: 1
            },
            rogue: {
                hp: 8,
                maxHp: 8,
                mp: 4,
                maxMp: 4,
                attack: 3,
                defense: 1,
                magic: 1,
                agility: 3,
                strength: 2
            }
        };

        const increases = statIncreases[player.class] || statIncreases.warrior;
        
        Object.keys(increases).forEach(stat => {
            if (stat.includes('max')) {
                const baseStat = stat.replace('max', '').toLowerCase();
                player[stat] += increases[stat];
                player[baseStat] = player[stat]; // Restaurar estadística actual
            } else {
                player[stat] += increases[stat];
            }
        });
    }

    static checkEvolution(player) {
        const evolutions = {
            warrior: { 5: 'Knight', 10: 'Paladin', 15: 'Champion' },
            mage: { 5: 'Wizard', 10: 'Archmage', 15: 'Sage' },
            rogue: { 5: 'Assassin', 10: 'Ninja', 15: 'Shadow' }
        };

        const classEvolutions = evolutions[player.class];
        if (classEvolutions && classEvolutions[player.level]) {
            player.evolution = classEvolutions[player.level];
        }
    }

    static async completeQuest(player, questDifficulty) {
        try {
            const questRewards = {
                easy: { exp: 20, gold: 15 },
                medium: { exp: 40, gold: 30 },
                hard: { exp: 80, gold: 60 }
            };

            const reward = questRewards[questDifficulty] || questRewards.easy;
            
            // Añadir experiencia
            await this.addExperience(player, reward.exp);
            
            // Añadir oro
            if (!player.gold) player.gold = 0;
            player.gold += reward.gold;
            
            // Incrementar contador de misiones completadas
            player.questsCompleted = (player.questsCompleted || 0) + 1;
            
            await player.save();
            
            return {
                success: true,
                exp: reward.exp,
                gold: reward.gold,
                levelUp: player.exp === 0 // Si exp es 0, significa que subió de nivel
            };
        } catch (error) {
            console.error('Error completing quest:', error);
            return { success: false, error: error.message };
        }
    }

    static calculateDamage(attacker, defender, isSpecial = false) {
        const baseDamage = isSpecial ? 
            attacker.attack * 1.5 + attacker.magic : 
            attacker.attack;
        
        const defenseReduction = defender.defense * 0.3;
        let damage = Math.max(1, baseDamage - defenseReduction);
        
        // Añadir variación aleatoria (±20%)
        const variation = 0.8 + Math.random() * 0.4;
        damage = Math.floor(damage * variation);
        
        return damage;
    }

    static async createBattle(playerId, enemyType = 'monster') {
        try {
            const enemy = this.generateEnemy(enemyType);
            
            const battle = new Battle({
                playerId,
                player: await Player.findById(playerId),
                enemy,
                type: enemyType
            });

            await battle.save();
            return battle;
        } catch (error) {
            console.error('Error creating battle:', error);
            throw error;
        }
    }

    static generateEnemy(type) {
        const enemies = {
            monster: [
                { name: 'Goblin', level: 1, hp: 30, attack: 8, defense: 3, gold: 15, exp: 20 },
                { name: 'Orc', level: 2, hp: 50, attack: 15, defense: 6, gold: 25, exp: 30 },
                { name: 'Minotaur', level: 4, hp: 90, attack: 22, defense: 10, gold: 45, exp: 50 }
            ],
            boss: [
                { name: 'Dragon', level: 10, hp: 200, attack: 35, defense: 20, gold: 100, exp: 150 }
            ]
        };

        const enemyList = enemies[type] || enemies.monster;
        const enemy = { ...enemyList[Math.floor(Math.random() * enemyList.length)] };
        enemy.currentHp = enemy.hp;
        
        return enemy;
    }

    static async handleBattleVictory(playerId, battle) {
        try {
            const player = await Player.findById(playerId);
            
            // Añadir experiencia
            await this.addExperience(player, battle.enemy.exp);
            
            // Añadir oro
            if (!player.gold) player.gold = 0;
            player.gold += battle.enemy.gold;
            
            // Incrementar contador de monstruos derrotados
            player.monstersDefeated = (player.monstersDefeated || 0) + 1;
            
            await player.save();
            
            return {
                success: true,
                exp: battle.enemy.exp,
                gold: battle.enemy.gold,
                player: player
            };
        } catch (error) {
            console.error('Error handling battle victory:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = RPGUtils;