const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'roles_refresh',
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🔄 Roles Refreshed')
            .setDescription('Available roles have been updated!')
            .setColor(0x3498DB)
            .addFields(
                {
                    name: '🛡️ Game Roles',
                    value: 'Warrior ⚔️\nMage 🔮\nArcher 🏹\nNovice 🎯'
                },
                {
                    name: '🎨 Color Roles',
                    value: 'Red 🔴\nBlue 🔵\nGreen 🟢\nGold 🟡'
                }
            )
            .setFooter({ text: 'Select your preferred roles' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('roles_game')
                    .setLabel('Game Roles')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('roles_color')
                    .setLabel('Color Roles')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('roles_notification')
                    .setLabel('Notifications')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.update({ embeds: [embed], components: [row] });
    }
};