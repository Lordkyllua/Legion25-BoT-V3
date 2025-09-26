const rpgUtil = require('../../utils/rpg');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'class_',
    async execute(interaction, client) {
        try {
            await interaction.deferUpdate();
            
            // Extraer la clase del customId (class_warrior -> warrior)
            const className = interaction.customId.replace('class_', '');
            const userId = interaction.user.id;
            
            console.log(`Class selection: User ${userId} choosing ${className}`);
            
            // Verificar si el usuario ya tiene clase
            const currentProfile = rpgUtil.getUserProfile(userId);
            if (currentProfile.class) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Already Have a Class')
                    .setDescription(`You already chose **${currentProfile.className}**!\n\nClass selection is permanent and cannot be changed.`)
                    .setFooter({ text: 'Developed by LordK' });

                return await interaction.editReply({ 
                    embeds: [errorEmbed], 
                    components: [] 
                });
            }
            
            // Intentar elegir la clase
            const result = rpgUtil.chooseClass(userId, className);
            
            if (result.success) {
                const classInfo = rpgUtil.classes[className];
                
                const successEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('🎉 Class Chosen Successfully!')
                    .setDescription(`You are now a **${classInfo.name}**!`)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields(
                        {
                            name: '📊 Your New Statistics',
                            value: `❤️ Health: ${currentProfile.maxHealth}\n⚔️ Attack: ${currentProfile.stats.attack}\n🛡️ Defense: ${currentProfile.stats.defense}\n🔮 Magic: ${currentProfile.stats.magic}\n🎯 Agility: ${currentProfile.stats.agility}`,
                            inline: true
                        },
                        {
                            name: '⚡ Starting Skills',
                            value: currentProfile.skills.map(skill => `• ${skill}`).join('\n'),
                            inline: true
                        },
                        {
                            name: '🎯 Next Steps',
                            value: '• Use `/quest` to start earning experience\n• Check `/rpg` to see your profile\n• Visit `/shop` when you have gold\n• Reach level 5 to unlock new skills!',
                            inline: false
                        }
                    )
                    .setImage(getClassImage(className))
                    .setFooter({ 
                        text: `Welcome to the world of adventurers, ${interaction.user.username}! • Developed by LordK`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp();

                await interaction.editReply({ 
                    embeds: [successEmbed], 
                    components: [] 
                });
                
                // Enviar mensaje de bienvenida adicional
                const welcomeEmbed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle('🌟 Begin Your Adventure!')
                    .setDescription(`**${interaction.user.username}**, your journey as a **${classInfo.name}** begins now!`)
                    .addFields(
                        {
                            name: '📖 Class Description',
                            value: classInfo.description
                        },
                        {
                            name: '🚀 Quick Start Guide',
                            value: [
                                '1. **Gain Experience**: Use `/quest` repeatedly',
                                '2. **Earn Gold**: Complete quests successfully', 
                                '3. **Buy Gear**: Visit `/shop` with your gold',
                                '4. **Level Up**: Reach new milestones and skills',
                                '5. **Evolve**: Transform at levels 25, 50, and 75!'
                            ].join('\n')
                        }
                    )
                    .setFooter({ text: 'Your adventure awaits! • Developed by LordK' });

                await interaction.followUp({ 
                    embeds: [welcomeEmbed],
                    ephemeral: true 
                });
                
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Class Selection Failed')
                    .setDescription(result.message)
                    .addFields({
                        name: '🔧 Troubleshooting',
                        value: 'If this error persists, please contact server administrators.'
                    })
                    .setFooter({ text: 'Developed by LordK' });

                await interaction.editReply({ 
                    embeds: [errorEmbed], 
                    components: [] 
                });
            }
            
        } catch (error) {
            console.error('Error in class selection:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ System Error')
                .setDescription('There was an error processing your class selection.')
                .addFields({
                    name: '🔄 What to do?',
                    value: 'Please try again or contact support if the issue continues.'
                })
                .setFooter({ text: 'Developed by LordK' });

            await interaction.editReply({ 
                embeds: [errorEmbed], 
                components: [] 
            });
        }
    }
};

// Función auxiliar para imágenes de clase
function getClassImage(className) {
    const images = {
        warrior: 'https://i.imgur.com/vnoVyMq.png',
        mage: 'https://i.imgur.com/z9s6UhW.png', 
        archer: 'https://i.imgur.com/k76vIXC.png'
    };
    return images[className] || 'https://i.imgur.com/3Q3R4x2.png';
}