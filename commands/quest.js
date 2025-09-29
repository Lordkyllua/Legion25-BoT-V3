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
            // ========== EASY QUESTS ==========
            { name: 'Forest Exploration', reward: { exp: 50, gold: 25 }, time: '5 minutes', difficulty: 'Easy' },
            { name: 'Goblin Camp Raid', reward: { exp: 75, gold: 40 }, time: '8 minutes', difficulty: 'Easy' },
            { name: 'Herb Gathering', reward: { exp: 40, gold: 20 }, time: '4 minutes', difficulty: 'Easy' },
            { name: 'Wolf Hunt', reward: { exp: 60, gold: 30 }, time: '6 minutes', difficulty: 'Easy' },
            { name: 'Bandit Patrol', reward: { exp: 70, gold: 35 }, time: '7 minutes', difficulty: 'Easy' },
            
            // ========== MEDIUM QUESTS ==========
            { name: 'Dungeon Crawl', reward: { exp: 100, gold: 50 }, time: '10 minutes', difficulty: 'Medium' },
            { name: 'Ancient Ruins', reward: { exp: 150, gold: 75 }, time: '12 minutes', difficulty: 'Medium' },
            { name: 'Orc Fortress', reward: { exp: 120, gold: 60 }, time: '11 minutes', difficulty: 'Medium' },
            { name: 'Sunken Temple', reward: { exp: 180, gold: 90 }, time: '14 minutes', difficulty: 'Medium' },
            { name: 'Crystal Caves', reward: { exp: 130, gold: 65 }, time: '10 minutes', difficulty: 'Medium' },
            { name: 'Abandoned Mine', reward: { exp: 110, gold: 55 }, time: '9 minutes', difficulty: 'Medium' },
            
            // ========== HARD QUESTS ==========
            { name: 'Dragon Hunt', reward: { exp: 200, gold: 100 }, time: '15 minutes', difficulty: 'Hard' },
            { name: 'Lich King Battle', reward: { exp: 250, gold: 125 }, time: '18 minutes', difficulty: 'Hard' },
            { name: 'Demon Invasion', reward: { exp: 300, gold: 150 }, time: '20 minutes', difficulty: 'Hard' },
            { name: 'Frozen Peak', reward: { exp: 220, gold: 110 }, time: '16 minutes', difficulty: 'Hard' },
            { name: 'Volcanic Core', reward: { exp: 280, gold: 140 }, time: '17 minutes', difficulty: 'Hard' },
            { name: 'Shadow Realm', reward: { exp: 350, gold: 175 }, time: '22 minutes', difficulty: 'Hard' },
            
            // ========== EXPERT QUESTS ==========
            { name: 'Celestial Palace', reward: { exp: 500, gold: 250 }, time: '25 minutes', difficulty: 'Expert' },
            { name: 'Abyssal Depths', reward: { exp: 600, gold: 300 }, time: '30 minutes', difficulty: 'Expert' },
            { name: 'Time Rift', reward: { exp: 450, gold: 225 }, time: '20 minutes', difficulty: 'Expert' },
            { name: 'Dimensional Gate', reward: { exp: 700, gold: 350 }, time: '35 minutes', difficulty: 'Expert' }
        ];

        // Filtrar quests por nivel del jugador
        const playerLevel = user.rpg.level;
        let availableQuests = quests;
        
        if (playerLevel < 10) {
            availableQuests = quests.filter(q => q.difficulty === 'Easy');
        } else if (playerLevel < 25) {
            availableQuests = quests.filter(q => q.difficulty === 'Easy' || q.difficulty === 'Medium');
        } else if (playerLevel < 40) {
            availableQuests = quests.filter(q => q.difficulty !== 'Expert');
        }
        // Nivel 40+ puede hacer todas las quests

        const randomQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];

        const embed = new EmbedBuilder()
            .setTitle('🏹 Available Quest')
            .setColor(getDifficultyColor(randomQuest.difficulty))
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

        // Usar customId dinámico con la dificultad
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
        // Easy Quests
        'Forest Exploration': 'Explore the mysterious forest and gather rare herbs. Beware of wild animals!',
        'Goblin Camp Raid': 'Attack the goblin camp and recover stolen treasures from the pesky creatures.',
        'Herb Gathering': 'Collect rare medicinal herbs from the enchanted meadows. A peaceful but rewarding task.',
        'Wolf Hunt': 'Hunt down the wolf pack that has been terrorizing local farmers and their livestock.',
        'Bandit Patrol': 'Patrol the trade routes and eliminate bandits preying on merchants.',
        
        // Medium Quests
        'Dungeon Crawl': 'Venture into the dark dungeon and defeat the monsters lurking within its depths.',
        'Ancient Ruins': 'Explore ancient ruins and uncover hidden secrets and treasures from a lost civilization.',
        'Orc Fortress': 'Storm the orc fortress and defeat their chieftain to bring peace to the region.',
        'Sunken Temple': 'Dive into the sunken temple beneath the lake and recover the sacred artifacts.',
        'Crystal Caves': 'Mine rare crystals from the dangerous caves while fending off crystal guardians.',
        'Abandoned Mine': 'Clear out the monsters that have taken over the abandoned dwarven mine.',
        
        // Hard Quests
        'Dragon Hunt': 'Face the mighty dragon that terrorizes the nearby villages. Not for the faint of heart!',
        'Lich King Battle': 'Challenge the Lich King in his necropolis and prevent his army of undead from rising.',
        'Demon Invasion': 'Close the demonic portal and push back the invading forces from the underworld.',
        'Frozen Peak': 'Scale the treacherous frozen mountain and defeat the ice elemental at its peak.',
        'Volcanic Core': 'Journey into the active volcano and defeat the fire lord in his molten domain.',
        'Shadow Realm': 'Enter the shadow realm and defeat the shadow beasts that threaten to consume our world.',
        
        // Expert Quests
        'Celestial Palace': 'Ascend to the celestial palace and challenge the gods themselves in their domain.',
        'Abyssal Depths': 'Descend into the abyssal depths of the ocean and confront the ancient leviathan.',
        'Time Rift': 'Stabilize the time rift before reality itself unravels. Handle with extreme caution.',
        'Dimensional Gate': 'Close the unstable dimensional gate before creatures from other realities invade.'
    };
    return descriptions[questName] || 'A mysterious and dangerous adventure awaits...';
}

function getRequiredLevel(difficulty) {
    const levels = {
        'Easy': 1,
        'Medium': 10,
        'Hard': 25,
        'Expert': 40
    };
    return levels[difficulty] || 1;
}

function getSuccessChance(difficulty) {
    const chances = {
        'Easy': 85,
        'Medium': 65,
        'Hard': 45,
        'Expert': 25
    };
    return chances[difficulty] || 50;
}

function getDifficultyColor(difficulty) {
    const colors = {
        'Easy': 0x27AE60,    // Green
        'Medium': 0xF39C12,  // Orange
        'Hard': 0xE74C3C,    // Red
        'Expert': 0x9B59B6   // Purple
    };
    return colors[difficulty] || 0x95A5A6;
}