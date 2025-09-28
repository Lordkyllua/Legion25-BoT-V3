const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');
const Gold = require('../models/Gold');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Display gold and level ranking leaderboards')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of ranking to display')
                .setRequired(false)
                .addChoices(
                    { name: 'Gold', value: 'gold' },
                    { name: 'Level', value: 'level' }
                )),
    async execute(interaction) {
        const rankingType = interaction.options.getString('type') || 'gold';

        if (rankingType === 'gold') {
            await showGoldRanking(interaction);
        } else {
            await showLevelRanking(interaction);
        }
    },
};

async function showGoldRanking(interaction) {
    const topRich = await Gold.getTopRich(10);
    
    const embed = new EmbedBuilder()
        .setTitle('🏆 Gold Ranking Leaderboard')
        .setColor(0xFFD700)
        .setDescription('Top 10 wealthiest adventurers:')
        .setThumbnail('https://i.imgur.com/7VQ0mOp.png')
        .setFooter({ text: 'Earn gold through quests, battles, and games!' });

    for (let i = 0; i < topRich.length; i++) {
        const record = topRich[i];
        try {
            const user = await interaction.client.users.fetch(record.userId);
            const userData = await User.findById(record.userId);
            const className = userData && userData.rpg ? userData.rpg.class : 'Adventurer';
            const level = userData && userData.rpg ? userData.rpg.level : 1;
            
            embed.addFields({
                name: `#${i + 1} ${user.username}`,
                value: `🪙 ${record.amount} Gold | ${className} Lv.${level}`,
                inline: false
            });
        } catch (error) {
            // Skip users that can't be fetched
            continue;
        }
    }

    if (topRich.length === 0) {
        embed.setDescription('No one has any gold yet! Be the first to earn some!');
    }

    await interaction.reply({ embeds: [embed] });
}

async function showLevelRanking(interaction) {
    const topPlayers = await User.getTopPlayers(10);
    
    const embed = new EmbedBuilder()
        .setTitle('⭐ Level Ranking Leaderboard')
        .setColor(0x3498DB)
        .setDescription('Top 10 most powerful adventurers:')
        .setThumbnail('https://i.imgur.com/xRk7Qq3.png')
        .setFooter({ text: 'Gain experience through quests and battles!' });

    for (let i = 0; i < topPlayers.length; i++) {
        const userData = topPlayers[i];
        try {
            const user = await interaction.client.users.fetch(userData.userId);
            const rpg = userData.rpg;
            
            embed.addFields({
                name: `#${i + 1} ${user.username}`,
                value: `Level ${rpg.level} ${rpg.class} | ${rpg.exp}/${rpg.maxExp} EXP`,
                inline: false
            });
        } catch (error) {
            // Skip users that can't be fetched
            continue;
        }
    }

    if (topPlayers.length === 0) {
        embed.setDescription('No players have started their RPG journey yet! Use `/rpg` to begin!');
    }

    await interaction.reply({ embeds: [embed] });
}