const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');
const pointsUtil = require('../utils/points');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Embark on a quest to earn experience, gold and points'),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const success = Math.random() > 0.3; // 70% success rate
            
            if (success) {
                const expGained = Math.floor(Math.random() * 30) + 20;
                const goldGained = Math.floor(Math.random() * 15) + 10;
                const pointsGained = Math.floor(Math.random() * 10) + 5;
                
                // Use the functions directly
                const levelUpResult = rpgUtil.addExperience(userId, expGained);
                pointsUtil.addPoints(userId, pointsGained);
                rpgUtil.addGold(userId, goldGained);
                
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Quest Completed!')
                    .setDescription('You successfully completed your quest!')
                    .addFields(
                        {
                            name: '⭐ Experience Gained',
                            value: `**+${expGained} EXP**`,
                            inline: true
                        },
                        {
                            name: '💰 Gold Obtained',
                            value: `**+${goldGained} gold**`,
                            inline: true
                        },
                        {
                            name: '🎯 Points Earned',
                            value: `**+${pointsGained} points**`,
                            inline: true
                        }
                    );
                
                if (levelUpResult.leveledUp) {
                    embed.addFields({
                        name: '🎉 Level Up!',
                        value: `Congratulations! You reached level **${levelUpResult.newLevel}**!`,
                        inline: false
                    });
                }
                
                embed.setFooter({ 
                    text: 'Great job adventurer! • Developed by LordK', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
                
                await interaction.reply({ embeds: [embed] });
                
            } else {
                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle('💥 Quest Failed')
                    .setDescription('Your quest did not go as planned...')
                    .addFields({
                        name: '💡 Tip',
                        value: 'Try again! Success will come with persistence.'
                    })
                    .setFooter({ 
                        text: 'Better luck next time! • Developed by LordK', 
                        iconURL: interaction.client.user.displayAvatarURL() 
                    });
                
                await interaction.reply({ embeds: [embed] });
            }
            
        } catch (error) {
            console.error('Error in quest command:', error);
            await interaction.reply({
                content: '❌ Error processing your quest. Please try again.',
                ephemeral: true
            });
        }
    }
};