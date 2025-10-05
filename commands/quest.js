const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');

const quests = {
    easy: [
        { name: 'Gather Herbs', exp: 50, gold: 25, duration: 5 },
        { name: 'Hunt Small Game', exp: 75, gold: 35, duration: 8 },
        { name: 'Deliver Message', exp: 40, gold: 20, duration: 4 }
    ],
    medium: [
        { name: 'Clear Bandit Camp', exp: 150, gold: 75, duration: 15 },
        { name: 'Retrieve Ancient Artifact', exp: 200, gold: 100, duration: 20 },
        { name: 'Protect Merchant Caravan', exp: 180, gold: 90, duration: 18 }
    ],
    hard: [
        { name: 'Slay Dragon', exp: 500, gold: 250, duration: 30 },
        { name: 'Conquer Dark Fortress', exp: 600, gold: 300, duration: 35 },
        { name: 'Rescue Royal Family', exp: 450, gold: 200, duration: 25 }
    ]
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Start a quest to earn gold and experience'),
    
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        
        if (!user) {
            return await interaction.reply({ 
                content: '❌ You need to start your RPG journey first! Use `/rpg start`', 
                ephemeral: true 
            });
        }

        if (user.activeQuest) {
            return await interaction.reply({ 
                content: `❌ You are already on a quest: **${user.activeQuest}**`, 
                ephemeral: true 
            });
        }

        if (user.cooldowns.quest && user.cooldowns.quest > new Date()) {
            const cooldownTime = Math.ceil((user.cooldowns.quest - new Date()) / 1000 / 60);
            return await interaction.reply({ 
                content: `⏰ You need to wait **${cooldownTime} minutes** before starting another quest!`, 
                ephemeral: true 
            });
        }

        const availableQuests = getUserAvailableQuests(user.level);
        const randomQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];

        const embed = new EmbedBuilder()
            .setTitle('🎯 Available Quest')
            .setColor(0xF1C40F)
            .addFields(
                { name: '📜 Quest', value: `**${randomQuest.name}**`, inline: true },
                { name: '⭐ Difficulty', value: getDifficulty(user.level), inline: true },
                { name: '⏱️ Duration', value: `${randomQuest.duration} minutes`, inline: true },
                { name: '🎁 Rewards', value: `**${randomQuest.exp}** XP • **${randomQuest.gold}** Gold`, inline: false }
            )
            .setFooter({ text: 'Complete quests to level up and earn gold!' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`start_quest_${randomQuest.name}`)
                    .setLabel('Start Quest')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel_quest')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ 
            content: `🎯 **${interaction.user.username}**, a quest awaits!`, 
            embeds: [embed], 
            components: [row] 
        });
    }
};

function getUserAvailableQuests(level) {
    if (level >= 50) return [...quests.easy, ...quests.medium, ...quests.hard];
    if (level >= 20) return [...quests.easy, ...quests.medium];
    return quests.easy;
}

function getDifficulty(level) {
    if (level >= 50) return 'Hard ⭐⭐⭐';
    if (level >= 20) return 'Medium ⭐⭐';
    return 'Easy ⭐';
}