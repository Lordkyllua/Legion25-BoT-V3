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
            
            // Usar la función corregida
            const profile = rpgUtil.getUserProfile(userId);
            const success = Math.random() > 0.25;
            
            if (success) {
                let expGained = Math.floor(Math.random() * 40) + 20;
                let goldGained = Math.floor(Math.random() * 25) + 15;
                let pointsGained = Math.floor(Math.random() * 15) + 5;
                
                if (profile.class === 'warrior') {
                    goldGained += 5;
                } else if (profile.class === 'mage') {
                    expGained += 10;
                } else if (profile.class === 'archer') {
                    pointsGained += 5;
                }
                
                expGained += profile.level * 2;
                goldGained += profile.level;
                
                // Usar las funciones corregidas
                const levelUpResult = rpgUtil.addExperience(userId, expGained);
                pointsUtil.addPoints(userId, pointsGained);
                rpgUtil.addGold(userId, goldGained);
                
                const questMessages = [
                    "You defeated a group of monsters!",
                    "You found a hidden treasure!",
                    "You completed a mission for the villagers!",
                    "You successfully explored ancient ruins!",
                    "You overcame an epic challenge!"
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
                        value: `Congratulations! You are now level **${levelUpResult.newLevel}**!`,
                        inline: false
                    });
                    
                    if (levelUpResult.newSkills && levelUpResult.newSkills.length > 0) {
                        embed.addFields({
                            name: '⚡ New Skills',
                            value: levelUpResult.newSkills.map(skill => `• ${skill}`).join('\n'),
                            inline: false
                        });
                    }
                }
                
                embed.setFooter({ 
                    text: 'Keep it up, adventurer! • Developed by LordK', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
                
                await interaction.reply({ embeds: [embed] });
                
            } else {
                const failMessages = [
                    "The monsters were too strong...",
                    "You got lost on the way and had to return.",
                    "The treasure turned out to be a trap.",
                    "A storm forced you to cancel the mission.",
                    "You found a greater challenge than expected."
                ];
                
                const randomFailMessage = failMessages[Math.floor(Math.random() * failMessages.length)];
                
                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle('💥 Quest Failed')
                    .setDescription(randomFailMessage)
                    .addFields({
                        name: '💡 Tip',
                        value: 'Do not give up. Try again!'
                    })
                    .setFooter({ 
                        text: 'Luck is not always on our side • Developed by LordK', 
                        iconURL: interaction.client.user.displayAvatarURL() 
                    });
                
                await interaction.reply({ embeds: [embed] });
            }
            
        } catch (error) {
            console.error('Error in quest command:', error);
            await interaction.reply({
                content: '❌ Error processing your quest. Try again later.',
                ephemeral: true
            });
        }
    }
};