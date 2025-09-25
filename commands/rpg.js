const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('View your RPG character profile - Tiny Survivors style'),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            
            // Usar la función correctamente - ahora es una función exportada
            const userProfile = rpgUtil.getUserProfile(userId);
            
            // Calcular porcentaje de progreso
            const progressPercent = Math.round((userProfile.exp / userProfile.expToNextLevel) * 100);
            const progressBar = '█'.repeat(Math.floor(progressPercent / 10)) + '░'.repeat(10 - Math.floor(progressPercent / 10));
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`⚔️ ${interaction.user.username}'s Survivor Profile`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription('*Your journey in the world of Tiny Survivors begins here!*')
                .addFields(
                    {
                        name: '🏹 Level',
                        value: `**${userProfile.level}**`,
                        inline: true
                    },
                    {
                        name: '⭐ Experience',
                        value: `${userProfile.exp}/${userProfile.expToNextLevel}`,
                        inline: true
                    },
                    {
                        name: '📊 Progress',
                        value: `${progressBar} ${progressPercent}%`,
                        inline: true
                    },
                    {
                        name: '❤️ Health',
                        value: `**${userProfile.health}** HP`,
                        inline: true
                    },
                    {
                        name: '💰 Gold',
                        value: `**${userProfile.gold}** coins`,
                        inline: true
                    },
                    {
                        name: '🛡️ Class',
                        value: `**${userProfile.class}**`,
                        inline: true
                    },
                    {
                        name: '⚔️ Equipment',
                        value: `Weapon: ${userProfile.equipment.weapon}\nArmor: ${userProfile.equipment.armor}`,
                        inline: false
                    },
                    {
                        name: '🎯 Skills',
                        value: userProfile.skills.map(skill => `• ${skill}`).join('\n') || 'No skills learned',
                        inline: false
                    }
                )
                .setImage('https://i.imgur.com/7V8Q3z2.png')
                .setFooter({
                    text: 'Survive and thrive in this Tiny Survivors adventure! • Developed by LordK',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in RPG command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Error Loading Profile')
                .setDescription('There was an error loading your RPG profile. Please try again later.')
                .setFooter({
                    text: 'Bot developed by LordK',
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            await interaction.reply({ 
                embeds: [errorEmbed],
                ephemeral: true 
            });
        }
    }
};