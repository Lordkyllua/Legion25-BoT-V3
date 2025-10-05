const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');

const monsters = {
    easy: [
        { name: 'Goblin', health: 50, damage: 5, exp: 25, gold: 15 },
        { name: 'Slime', health: 40, damage: 4, exp: 20, gold: 10 },
        { name: 'Wolf', health: 60, damage: 6, exp: 30, gold: 20 }
    ],
    medium: [
        { name: 'Orc', health: 100, damage: 12, exp: 75, gold: 50 },
        { name: 'Skeleton', health: 80, damage: 10, exp: 60, gold: 40 },
        { name: 'Dark Mage', health: 70, damage: 15, exp: 80, gold: 45 }
    ],
    hard: [
        { name: 'Minotaur', health: 200, damage: 25, exp: 150, gold: 100 },
        { name: 'Dragon Whelp', health: 180, damage: 30, exp: 200, gold: 120 },
        { name: 'Lich', health: 150, damage: 35, exp: 180, gold: 110 }
    ]
};

const bosses = [
    { name: 'Ancient Dragon', health: 500, damage: 50, exp: 500, gold: 300, levelReq: 30 },
    { name: 'Demon Lord', health: 600, damage: 60, exp: 600, gold: 350, levelReq: 50 },
    { name: 'Celestial Titan', health: 800, damage: 70, exp: 800, gold: 500, levelReq: 80 }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Battle monsters and bosses for rewards'),
    
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        
        if (!user) {
            return await interaction.reply({ 
                content: '❌ You need to start your RPG journey first! Use `/rpg start`', 
                ephemeral: true 
            });
        }

        if (user.health <= 0) {
            return await interaction.reply({ 
                content: '💀 You are defeated! Wait for your health to regenerate or use healing items.', 
                ephemeral: true 
            });
        }

        if (user.cooldowns.fight && user.cooldowns.fight > new Date()) {
            const cooldownTime = Math.ceil((user.cooldowns.fight - new Date()) / 1000);
            return await interaction.reply({ 
                content: `⏰ You need to wait **${cooldownTime} seconds** before fighting again!`, 
                ephemeral: true 
            });
        }

        // 10% chance for boss if level requirement met
        const isBoss = Math.random() < 0.1 && bosses.some(boss => user.level >= boss.levelReq);
        const enemy = isBoss ? 
            bosses.filter(boss => user.level >= boss.levelReq)[Math.floor(Math.random() * bosses.filter(boss => user.level >= boss.levelReq).length)] :
            getRandomMonster(user.level);

        const embed = new EmbedBuilder()
            .setTitle(isBoss ? '👑 BOSS BATTLE!' : '⚔️ Monster Encounter!')
            .setColor(isBoss ? 0xE74C3C : 0xE67E22)
            .addFields(
                { name: '🎯 Enemy', value: `**${enemy.name}** ${isBoss ? '👑' : ''}`, inline: true },
                { name: '❤️ Health', value: `**${enemy.health}**`, inline: true },
                { name: '⚔️ Damage', value: `**${enemy.damage}**`, inline: true },
                { name: '🎁 Rewards', value: `**${enemy.exp}** XP • **${enemy.gold}** Gold`, inline: false }
            )
            .setFooter({ text: 'Choose your battle strategy!' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`fight_attack_${enemy.name}`)
                    .setLabel('Attack 🗡️')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`fight_skill_${enemy.name}`)
                    .setLabel('Use Skill 🔥')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('fight_flee')
                    .setLabel('Flee 🏃')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ 
            content: `⚔️ **${interaction.user.username}** encountered ${isBoss ? 'a BOSS' : 'a monster'}!`, 
            embeds: [embed], 
            components: [row] 
        });
    }
};

function getRandomMonster(level) {
    let pool = [];
    if (level >= 50) pool = [...monsters.easy, ...monsters.medium, ...monsters.hard];
    else if (level >= 20) pool = [...monsters.easy, ...monsters.medium];
    else pool = monsters.easy;
    
    return pool[Math.floor(Math.random() * pool.length)];
}