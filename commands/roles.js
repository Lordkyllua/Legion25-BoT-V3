const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Select roles for yourself'),
    async execute(interaction) {
        const rolesConfig = JSON.parse(fs.readFileSync('./utils/rolesConfig.json', 'utf8'));
        
        if (rolesConfig.selectableRoles.length === 0) {
            return await interaction.reply({ 
                content: 'No roles are currently available for selection. Administrators can set them up with `/roleadmin`.', 
                ephemeral: true 
            });
        }

        const options = rolesConfig.selectableRoles.map(roleId => {
            const role = interaction.guild.roles.cache.get(roleId);
            return {
                label: role?.name || 'Unknown Role',
                value: roleId,
                description: `Select the ${role?.name} role`
            };
        });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('role_selection')
            .setPlaceholder('Choose your roles...')
            .setMinValues(0)
            .setMaxValues(options.length)
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Select the roles you want:',
            components: [row],
            ephemeral: true
        });
    },
};