const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Manage your server roles'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎭 Role Management')
            .setDescription('Manage your roles in this server. Choose from available roles or create custom ones.')
            .setColor(0xE91E63)
            .addFields(
                {
                    name: '🛡️ Game Roles',
                    value: 'Warrior ⚔️\nMage 🔮\nArcher 🏹\nNovice 🎯'
                },
                {
                    name: '🎨 Color Roles',
                    value: 'Red 🔴\nBlue 🔵\nGreen 🟢\nGold 🟡'
                },
                {
                    name: '📢 Notification Roles',
                    value: 'Events 📅\nUpdates 🔔\nQuests 🎯'
                }
            )
            .setFooter({ text: 'Select roles that match your playstyle!' });

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
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('roles_refresh')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};