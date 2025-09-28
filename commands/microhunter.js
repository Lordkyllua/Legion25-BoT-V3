const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('microhunter')
        .setDescription('Information about Micro Hunter game'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎯 Micro Hunter')
            .setDescription('The game that inspired this bot!')
            .setColor(0x3498DB)
            .addFields(
                { name: 'Official Website', value: '[Visit Micro Hunter](https://www.micro-hunter.com/?lang=en)' },
                { name: 'Game Features', value: '• Browser-based RPG\n• Character progression\n• Item collection\n• Strategic battles' },
                { name: 'Bot Inspiration', value: 'This bot brings Micro Hunter\\'s core mechanics to Discord with RPG elements, item shops, and character progression.' }
            )
            .setFooter({ text: 'Developed by LordK and inspired by Micro Hunter' });

        await interaction.reply({ embeds: [embed] });
    },
};