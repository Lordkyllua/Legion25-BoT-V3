const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addExperience } = require('../utils/rpg');
const { addGold } = require('../utils/gold');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Battle monsters and bosses for rewards')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of battle')
                .setRequired(true)
                .addChoices(
                    { name: 'Random Monster', value: 'monster' },
                    { name: 'Boss Battle', value: 'boss' },
                    { name: 'Arena Challenge', value: 'arena' }
                )),
    async execute(interaction) {
        const userId = interaction.user.id;
        const battleType = interaction.options.getString('type');
        const user = await User.findById(userId);

        if (!user || !user.rpg) {
            return await interaction.reply({ 
                content: 'You need to create a character first! Use `/rpg` to get started.', 
                ephemeral: true 
            });
        }

        const player = user.rpg;
        
        let enemy;
        let battleEmbed;

        switch (battleType) {
            case 'monster':
                enemy = generateRandomMonster(player.level);
                battleEmbed = createBattleEmbed(interaction, player, enemy, '🐉 Random Monster Encounter!');
                break;
                
            case 'boss':
                const availableBosses = getAvailableBosses(player.level);
                enemy = availableBosses[Math.floor(Math.random() * availableBosses.length)];
                battleEmbed = createBattleEmbed(interaction, player, enemy, '👑 BOSS BATTLE!');
                break;
                
            case 'arena':
                enemy = generateArenaOpponent(player.level);
                battleEmbed = createBattleEmbed(interaction, player, enemy, '⚔️ Arena Challenge!');
                break;
        }

        const attackButton = new ButtonBuilder()
            .setCustomId(`fight_attack_${battleType}`)
            .setLabel('Attack')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('⚔️');

        const specialButton = new ButtonBuilder()
            .setCustomId(`fight_special_${battleType}`)
            .setLabel('Special Attack')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('💥');

        const fleeButton = new ButtonBuilder()
            .setCustomId('fight_flee')
            .setLabel('Flee')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🏃‍♂️');

        const row = new ActionRowBuilder().addComponents(attackButton, specialButton, fleeButton);

        // Guardar datos de la batalla temporalmente
        const battleData = {
            player: { ...player, currentHp: player.hp },
            enemy: enemy,
            type: battleType,
            turn: 'player'
        };

        // Guardar en la base de datos o en memoria (simplificado)
        interaction.client.battleData = interaction.client.battleData || {};
        interaction.client.battleData[userId] = battleData;

        await interaction.reply({ 
            embeds: [battleEmbed], 
            components: [row] 
        });
    },
};

// ========== SISTEMA DE ENEMIGOS ==========

function generateRandomMonster(playerLevel) {
    const monsters = [
        { name: 'Goblin', level: Math.max(1, playerLevel - 2), hp: 30, attack: 8, defense: 3, gold: 15, exp: 20 },
        { name: 'Wolf', level: Math.max(1, playerLevel - 1), hp: 25, attack: 10, defense: 2, gold: 12, exp: 18 },
        { name: 'Skeleton', level: playerLevel, hp: 40, attack: 12, defense: 4, gold: 20, exp: 25 },
        { name: 'Orc', level: playerLevel + 1, hp: 50, attack: 15, defense: 6, gold: 25, exp: 30 },
        { name: 'Troll', level: playerLevel + 2, hp: 70, attack: 18, defense: 8, gold: 35, exp: 40 },
        { name: 'Minotaur', level: playerLevel + 3, hp: 90, attack: 22, defense: 10, gold: 45, exp: 50 }
    ];

    const monster = monsters[Math.floor(Math.random() * monsters.length)];
    monster.currentHp = monster.hp;
    return monster;
}

function getAvailableBosses(playerLevel) {
    const allBosses = [
        {
            name: '🐉 Ancient Dragon',
            level: 10,
            hp: 200,
            attack: 25,
            defense: 15,
            gold: 100,
            exp: 150,
            description: 'A legendary dragon that has lived for centuries',
            special: 'Fire Breath - Deals extra damage'
        },
        {
            name: '👑 Lich King',
            level: 20,
            hp: 300,
            attack: 35,
            defense: 20,
            gold: 200,
            exp: 250,
            description: 'Undead monarch commanding an army of skeletons',
            special: 'Death Touch - Reduces player HP by 30%'
        },
        {
            name: '🌊 Kraken',
            level: 30,
            hp: 400,
            attack: 45,
            defense: 25,
            gold: 350,
            exp: 400,
            description: 'Giant sea monster from the depths of the ocean',
            special: 'Tentacle Slam - Stuns player for one turn'
        },
        {
            name: '🔥 Phoenix',
            level: 40,
            hp: 500,
            attack: 55,
            defense: 30,
            gold: 500,
            exp: 600,
            description: 'Mythical bird of fire that resurrects from ashes',
            special: 'Rebirth - Heals 50% HP once when defeated'
        },
        {
            name: '⚡ Thunder Giant',
            level: 50,
            hp: 700,
            attack: 65,
            defense: 35,
            gold: 700,
            exp: 800,
            description: 'Colossal being that controls storms and lightning',
            special: 'Lightning Strike - Chance to paralyze'
        },
        {
            name: '💀 Death Reaper',
            level: 60,
            hp: 900,
            attack: 75,
            defense: 40,
            gold: 900,
            exp: 1000,
            description: 'Entity that collects souls and commands death',
            special: 'Soul Steal - Heals based on damage dealt'
        },
        {
            name: '🌟 Celestial Titan',
            level: 75,
            hp: 1200,
            attack: 90,
            defense: 50,
            gold: 1200,
            exp: 1500,
            description: 'God-like being from the celestial realms',
            special: 'Divine Judgment - Massive area damage'
        },
        {
            name: '🕳️ Void Abomination',
            level: 100,
            hp: 2000,
            attack: 120,
            defense: 70,
            gold: 2000,
            exp: 2500,
            description: 'Creature from beyond reality that consumes worlds',
            special: 'Reality Tear - Ignores defense'
        }
    ];

    return allBosses.filter(boss => boss.level <= playerLevel + 10 && boss.level >= playerLevel - 5);
}

function generateArenaOpponent(playerLevel) {
    const arenaLevel = Math.min(100, playerLevel + Math.floor(Math.random() * 10) - 2);
    const hp = 80 + (arenaLevel * 8);
    const attack = 15 + (arenaLevel * 2);
    const defense = 8 + (arenaLevel * 1);

    return {
        name: `Arena Champion Lv.${arenaLevel}`,
        level: arenaLevel,
        hp: hp,
        currentHp: hp,
        attack: attack,
        defense: defense,
        gold: arenaLevel * 5,
        exp: arenaLevel * 8,
        description: 'Professional fighter from the grand arena'
    };
}

// ========== SISTEMA DE COMBATE ==========

function createBattleEmbed(interaction, player, enemy, title) {
    const playerHpBar = createHealthBar(player.hp, player.hp);
    const enemyHpBar = createHealthBar(enemy.currentHp, enemy.hp);

    return new EmbedBuilder()
        .setTitle(title)
        .setColor(0xE74C3C)
        .setDescription(`**${enemy.name}** - ${enemy.description || 'A dangerous foe'}`)
        .addFields(
            { 
                name: `🧙 ${interaction.user.username}`, 
                value: `Level ${player.level} ${player.class}\nHP: ${playerHpBar}\n⚔️ ATK: ${player.attack} 🛡️ DEF: ${player.defense}`,
                inline: true 
            },
            { 
                name: `🦹 ${enemy.name}`, 
                value: `Level ${enemy.level}\nHP: ${enemyHpBar}\n⚔️ ATK: ${enemy.attack} 🛡️ DEF: ${enemy.defense}`,
                inline: true 
            },
            {
                name: '🎯 Battle Info',
                value: enemy.special ? `**Special Ability:** ${enemy.special}` : 'No special abilities',
                inline: false
            }
        )
        .setFooter({ text: 'Choose your action!' });
}

function createHealthBar(current, max) {
    const percentage = current / max;
    const bars = 10;
    const filledBars = Math.round(bars * percentage);
    const emptyBars = bars - filledBars;
    
    return '█'.repeat(filledBars) + '░'.repeat(emptyBars) + ` ${current}/${max}`;
}

function calculateDamage(attacker, defender, isSpecial = false) {
    const baseDamage = isSpecial ? attacker.attack * 1.5 : attacker.attack;
    const defenseReduction = defender.defense * 0.5;
    let damage = Math.max(1, baseDamage - defenseReduction);
    
    // Critical hit chance (15%)
    const isCritical = Math.random() < 0.15;
    if (isCritical) {
        damage *= 2;
    }
    
    // Random variation (±20%)
    damage *= 0.8 + (Math.random() * 0.4);
    
    return {
        damage: Math.round(damage),
        isCritical: isCritical
    };
}

// Exportar funciones para los componentes de botones
module.exports.generateRandomMonster = generateRandomMonster;
module.exports.getAvailableBosses = getAvailableBosses;
module.exports.calculateDamage = calculateDamage;
module.exports.createBattleEmbed = createBattleEmbed;