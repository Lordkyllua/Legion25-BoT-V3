const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'get_support',
    async execute(interaction, client) {
        try {
            await interaction.deferUpdate();
            
            const supportEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('🆘 Support & Help Center')
                .setDescription('Need assistance with the Survivor Bot? Here are resources to help you:')
                .addFields(
                    {
                        name: '🎮 About the Inspiration',
                        value: 'This bot is inspired by **Micro Hunter** - an incremental idle survival game.'
                    },
                    {
                        name: '📖 Common Issues & Solutions',
                        value: [
                            '• **Commands not working?** Check bot permissions',
                            '• **Class selection?** You can only choose once',
                            '• **Evolution system?** Available at levels 25, 50, 75',
                            '• **Gameplay questions?** Use `/microhunter` for game info'
                        ].join('\n')
                    },
                    {
                        name: '🔧 Technical Support',
                        value: [
                            '• Ensure the bot has proper permissions',
                            '• Check that commands are registered',
                            '• Verify the bot is online and responsive',
                            '• Contact server admins for setup issues'
                        ].join('\n')
                    },
                    {
                        name: '🌐 Useful Links',
                        value: [
                            '• [Micro Hunter Game](https://www.micro-hunter.com/?lang=en)',
                            '• [Micro Hunter Website](https://www.micro-hunter.com/)',
                            '• [More Games](https://www.micro-hunter.com/games.html)'
                        ].join('\n')
                    }
                )
                .setFooter({
                    text: 'Inspired by Micro Hunter • Bot developed by LordK',
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.editReply({ 
                embeds: [supportEmbed],
                components: [] 
            });
            
        } catch (error) {
            console.error('Error in get_support button:', error);
            await interaction.editReply({ 
                content: '❌ Error loading support information. Please try the Micro Hunter game while we fix this!',
                components: [] 
            });
        }
    }
};