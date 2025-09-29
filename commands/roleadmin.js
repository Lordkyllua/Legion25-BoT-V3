const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleadmin')
        .setDescription('Admin command to manage selectable roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const guildRoles = interaction.guild.roles.cache
            .filter(role => role.name !== '@everyone' && !role.managed)
            .sort((a, b) => b.position - a.position);

        const options = Array.from(guildRoles.values()).slice(0, 25).map(role => ({
            label: role.name,
            value: role.id,
            description: `ID: ${role.id}`
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('role_admin_selection')
            .setPlaceholder('Select roles for users to choose...')
            .setMinValues(0)
            .setMaxValues(options.length)
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Select which roles users can assign to themselves:',
            components: [row],
            ephemeral: true
        });
    },
};