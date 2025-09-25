const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');
const pointsUtil = require('../utils/points');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Go on a quest to earn experience, points, and gold'),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const success = Math.random() > 0.3;
            
            if (success) {
                const expGained = Math.floor(Math.random() * 50) + 25;
                const pointsGained = Math.floor(Math.random() * 20) + 10;
                const goldGained = Math.floor(Math.random() * 15) + 5;
                
                // Usar las funciones corregidas
                const levelUpResult = rpgUtil.addExperience(userId, expGained);
                pointsUtil.addPoints(userId, pointsGained);
                rpgUtil.addGold(userId, goldGained);
                
                const questMessages = [
                    "You bravely defeated a group of monsters!",
                    "You discovered a hidden treasure chest!",
                    "You completed a challenging dungeon!",
                    "You helped villagers defeat a boss!",
                    "You explored ancient ruins successfully!"
                ];
                
                const randomMessage = questMessages[Math.floor(Math.random() * questMessages.length)];
                
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Quest Completed!')
                    .setDescription(randomMessage)
                    .addFields(
                        {
                            name: '⭐ Experience Gained',
                            value: `**+${expGained} EXP**`,
                            inline: true
                        },
                        {
                            name: '💰 Gold Found',
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
                    text: 'Great job survivor! • Developed by LordK',
                    iconURL: interaction.client.user.displayAvatarURL()
                });
                
                await interaction.reply({ embeds: [embed] });
                
            } else {
                const failMessages = [
                    "The monsters were too strong... better luck next time!",
                    "You got lost in the dungeon and had to retreat.",
                    "The treasure chest was trapped!",
                    "A powerful boss defeated your party.",
                    "You encountered unexpected challenges and had to return."
                ];
                
                const randomFailMessage = failMessages[Math.floor(Math.random() * failMessages.length)];
                
                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle('💥 Quest Failed')
                    .setDescription(randomFailMessage)
                    .setFooter({
                        text: 'Don\'t give up! Try again soon. • Developed by LordK',
                        iconURL: interaction.client.user.displayAvatarURL()
                    });
                
                await interaction.reply({ embeds: [embed] });
            }
            
        } catch (error) {
            console.error('Error in quest command:', error);
            await interaction.reply({
                content: '❌ There was an error processing your quest. Please try again later.',
                ephemeral: true
            });
        }
    }
};