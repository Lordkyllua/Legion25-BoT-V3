const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addExperience } = require('../utils/rpg');
const { addGold } = require('../utils/gold');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Start a quest for rewards'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findById(userId);

        if (!user || !user.rpg) {
            return await interaction.reply({ 
                content: 'You need to create a character first! Use `/rpg` to get started.', 
                ephemeral: true 
            });
        }

        const quests = [
            { name: 'Forest Exploration', reward: { exp: 50, gold: 25 }, time: '5 minutes', difficulty: 'Easy' },
            { name: 'Dungeon Crawl', reward: { exp: 100, gold: 50 }, time: '10 minutes', difficulty: 'Medium' },
            { name: 'Dragon Hunt', reward: { exp: 200, gold: 100 }, time: '15 minutes', difficulty: 'Hard' },
            { name: 'Goblin Camp Raid', reward: { exp: 75, gold: 40 }, time: '8 minutes', difficulty: 'Easy' },
            { name: 'Ancient Ruins', reward: { exp: 150, gold: 75 }, time: '12 minutes', difficulty: 'Medium' }
        ];

        const randomQuest = quests[Math.floor(Math.random() * quests.length)];

        const embed = new EmbedBuilder()
            .setTitle('🏹 Available Quest')
            .setColor(0xF39C12)
            .setDescription(`**${randomQuest.name}**\n\n${getQuestDescription(randomQuest.name)}`)
            .addFields(
                { name: '⭐ Difficulty', value: randomQuest.difficulty, inline: true },
                { name: '⏱️ Duration', value: randomQuest.time, inline: true },
                { name: '📊 Required Level', value: `Level ${getRequiredLevel(randomQuest.difficulty)}`, inline: true },
                { name: '🎯 Experience Reward', value: `${randomQuest.reward.exp} EXP`, inline: true },
                { name: '💰 Gold Reward', value: `🪙 ${randomQuest.reward.gold}`, inline: true },
                { name: '🎲 Success Chance', value: `${getSuccessChance(randomQuest.difficulty)}%`, inline: true }
            )
            .setFooter({ text: 'Click "Start Quest" to begin your adventure!' });

        const startButton = new ButtonBuilder()
            .setCustomId(`start_quest_${randomQuest.difficulty.toLowerCase()}`)
            .setLabel('Start Quest')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🏹');

        const row = new ActionRowBuilder().addComponents(startButton);

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};

function getQuestDescription(questName) {
    const descriptions = {
        'Forest Exploration': 'Explore the mysterious forest and gather rare herbs. Beware of wild animals!',
        'Dungeon Crawl': 'Venture into the dark dungeon and defeat the monsters lurking within.',
        'Dragon Hunt': 'Face the mighty dragon that terrorizes the nearby villages. Not for the faint of heart!',
        'Goblin Camp Raid': 'Attack the goblin camp and recover stolen treasures.',
        'Ancient Ruins': 'Explore ancient ruins and uncover hidden secrets and treasures.'
    };
    return descriptions[questName] || 'A mysterious quest awaits...';
}

function getRequiredLevel(difficulty) {
    const levels = {
        'Easy': 1,
        'Medium': 10,
        'Hard': 25
    };
    return levels[difficulty] || 1;
}

function getSuccessChance(difficulty) {
    const chances = {
        'Easy': 80,
        'Medium': 60,
        'Hard': 40
    };
    return chances[difficulty] || 50;
}