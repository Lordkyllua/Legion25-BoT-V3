const { EmbedBuilder } = require('discord.js');
const { addExperience } = require('../../utils/rpg');
const { addGold } = require('../../utils/gold');

module.exports = {
    customId: 'start_quest_',
    async execute(interaction) {
        const difficulty = interaction.customId.replace('start_quest_', '');
        
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
            await addExperience(interaction.user.id, reward.exp);
            await addGold(interaction.user.id, reward.gold);
            
            const embed = new EmbedBuilder()
                .setTitle('🎉 Quest Completed!')
                .setColor(0x00FF00)
                .setDescription('You successfully completed your quest!')
                .addFields(
                    { name: '🏆 Rewards', value: `⭐ ${reward.exp} EXP\n🪙 ${reward.gold} Gold`, inline: true },
                    { name: '📊 Difficulty', value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), inline: true }
                )
                .setFooter({ text: 'Great job adventurer!' });

            await interaction.update({ 
                embeds: [embed], 
                components: [] 
            });
        } else {
            // Quest failed
            const embed = new EmbedBuilder()
                .setTitle('💀 Quest Failed')
                .setColor(0xFF0000)
                .setDescription('Your quest was not successful. Better luck next time!')
                .addFields(
                    { name: '📊 Difficulty', value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), inline: true },
                    { name: '💡 Tip', value: 'Try an easier quest or level up your character!', inline: true }
                )
                .setFooter({ text: 'Don\'t give up!' });

            await interaction.update({ 
                embeds: [embed], 
                components: [] 
            });
        }
    },
};