const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    customId: 'rpg_quests',
    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findById(userId);

        if (!user || !user.rpg) {
            await interaction.reply({ 
                content: 'You need to create a character first! Use `/rpg` to get started.', 
                ephemeral: true 
            });
            return;
        }

        const rpg = user.rpg;
        
        const embed = new EmbedBuilder()
            .setTitle(`🏹 ${interaction.user.username}'s Quest Log`)
            .setColor(0xF39C12)
            .setDescription('Your adventure progress and achievements')
            .addFields(
                { 
                    name: '📊 Quest Statistics', 
                    value: `✅ Quests Completed: ${rpg.questsCompleted || 0}\n🐉 Monsters Defeated: ${rpg.monstersDefeated || 0}`,
                    inline: true 
                },
                { 
                    name: '⭐ Adventure Level', 
                    value: `Level ${rpg.level}\nEXP: ${rpg.exp}/${rpg.maxExp}`,
                    inline: true 
                }
            )
            .setFooter({ text: 'Use /quest to start a new adventure!' });

        // Add quest recommendations based on level
        const recommendedQuests = getRecommendedQuests(rpg.level);
        if (recommendedQuests.length > 0) {
            embed.addFields({
                name: '🎯 Recommended Quests',
                value: recommendedQuests.map(quest => `• **${quest.name}** (${quest.difficulty}) - ${quest.reward} gold`).join('\n'),
                inline: false
            });
        }

        // Add achievements
        const achievements = getAchievements(rpg);
        if (achievements.length > 0) {
            embed.addFields({
                name: '🏆 Achievements',
                value: achievements.join('\n'),
                inline: false
            });
        }

        await interaction.reply({ 
            embeds: [embed], 
            ephemeral: true 
        });
    },
};

function getRecommendedQuests(level) {
    if (level < 10) {
        return [
            { name: 'Forest Exploration', difficulty: 'Easy', reward: 25 },
            { name: 'Goblin Camp Raid', difficulty: 'Easy', reward: 40 }
        ];
    } else if (level < 25) {
        return [
            { name: 'Dungeon Crawl', difficulty: 'Medium', reward: 50 },
            { name: 'Ancient Ruins', difficulty: 'Medium', reward: 75 }
        ];
    } else {
        return [
            { name: 'Dragon Hunt', difficulty: 'Hard', reward: 100 },
            { name: 'Lich King Battle', difficulty: 'Hard', reward: 150 }
        ];
    }
}

function getAchievements(rpg) {
    const achievements = [];
    
    if (rpg.level >= 10) achievements.push('🎖️ Level 10 Adventurer');
    if (rpg.level >= 25) achievements.push('🏅 Level 25 Hero');
    if (rpg.level >= 50) achievements.push('👑 Level 50 Champion');
    if (rpg.questsCompleted >= 10) achievements.push('📚 Quest Master');
    if (rpg.monstersDefeated >= 50) achievements.push('⚔️ Monster Slayer');
    
    return achievements.length > 0 ? achievements : ['🌟 No achievements yet. Keep adventuring!'];
}