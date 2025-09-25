const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'get_support',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const supportEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🆘 Support & Help')
            .setDescription('Need help with the bot? Here are some resources:')
            .addFields(
                {
                    name: '📖 Common Issues',
                    value: [
                        '• **Commands not working?** Make sure the bot has proper permissions',
                        '• **Can\'t choose class?** You can only choose once per character',
                        '• **Shop items missing?** Some items require specific levels or classes',
                        '• **Evolution not available?** Check if you meet the level requirements'
                    ].join('\n')
                },
                {
                    name: '🔧 Technical Support',
                    value: [
                        '• Ensure the bot is online and has required intents',
                        '• Check that all commands are properly registered',
                        '• Verify file permissions for data storage',
                        '• Restart the bot if issues persist'
                    ].join('\n')
                },
                {
                    name: '🎮 Gameplay Tips',
                    value: [
                        '• Use `/quest` frequently to level up faster',
                        '• Save gold for class-specific items in `/shop`',
                        '• Choose your evolution path carefully - it\'s permanent!',
                        '• Higher level quests give better rewards'
                    ].join('\n')
                }
            )
            .setFooter({
                text: 'Developed by LordK • For additional help, contact server administrators',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.editReply({ 
            embeds: [supportEmbed],
            components: [] 
        });
    }
};