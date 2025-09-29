const { EmbedBuilder } = require('discord.js');
const { completeQuest } = require('../../utils/rpg');

module.exports = {
    customId: 'start_quest_', // El _ al final indica que es un prefijo dinámico
    async execute(interaction) {
        const difficulty = interaction.customId.replace('start_quest_', '');
        
        console.log(`🏹 Starting ${difficulty} quest for ${interaction.user.tag}`.green);
        
        const questRewards = {
            easy: { exp: 50, gold: 25, success: 80 },
            medium: { exp: 100, gold: 50, success: 60 },
            hard: { exp: 200, gold: 100, success: 40 }
        };

        const reward = questRewards[difficulty] || questRewards.easy;
        
        // Simulate quest outcome
        const success = Math.random() * 100 < reward.success;
        
        if (success) {
            // Quest successful
            try {
                const result = await completeQuest(interaction.user.id, reward.exp, reward.gold);
                
                const embed = new EmbedBuilder()
                    .setTitle('🎉 Quest Completed!')
                    .setColor(0x00FF00)
                    .setDescription('You successfully completed your quest!')
                    .addFields(
                        { name: '🏆 Rewards', value: `⭐ ${reward.exp} EXP\n🪙 ${reward.gold} Gold`, inline: true },
                        { name: '📊 Difficulty', value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), inline: true },
                        { name: '📈 Total Quests', value: `${result.questsCompleted} completed`, inline: true }
                    )
                    .setFooter({ text: 'Great job adventurer!' });

                // Add level up message if applicable
                if (result.levelUp && result.levelUp.levelsGained > 0) {
                    embed.addFields({
                        name: '🎊 Level Up!',
                        value: `You reached level ${result.levelUp.user.level}!`,
                        inline: false
                    });
                }

                await interaction.update({ 
                    embeds: [embed], 
                    components: [] 
                });
                
                console.log(`✅ Quest successful for ${interaction.user.tag}`.green);
            } catch (error) {
                console.error('Error rewarding quest:', error);
                await interaction.update({ 
                    content: 'There was an error processing your quest rewards.', 
                    components: [] 
                });
            }
        } else {
            // Quest failed
            const embed = new EmbedBuilder()
                .setTitle('💀 Quest Failed')
                .setColor(0xFF0000)
                .setDescription('Your quest was not successful. Better luck next time!')
                .addFields(
                    { name: '📊 Difficulty', value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), inline: true },
                    { name: '🎯 Result', value: 'Failed', inline: true },
                    { name: '💡 Tip', value: 'Try an easier quest or level up your character!', inline: true }
                )
                .setFooter({ text: 'Don\'t give up!' });

            await interaction.update({ 
                embeds: [embed], 
                components: [] 
            });
            
            console.log(`❌ Quest failed for ${interaction.user.tag}`.red);
        }
    },
};