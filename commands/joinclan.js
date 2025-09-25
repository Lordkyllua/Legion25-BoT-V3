const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joinclan')
        .setDescription('Join an existing clan')
        .addStringOption(option =>
            option.setName('clan_id')
                .setDescription('ID of the clan to join')
                .setRequired(true)),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('👥 Join Clan')
            .setDescription('Clan joining system coming soon!')
            .addFields({
                name: '🎯 Planned Functionality',
                value: '• Browse available clans\n• Send join requests\n• Clan approval system\n• Member roles and permissions'
            })
            .setFooter({ text: 'Developed by LordK • Feature in development' });

        await interaction.reply({ embeds: [embed] });
    }
};