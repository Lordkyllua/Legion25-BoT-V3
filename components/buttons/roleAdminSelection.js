const fs = require('fs');

module.exports = {
    customId: 'role_admin_selection',
    async execute(interaction) {
        const selectedRoleIds = interaction.values;
        
        const rolesConfig = {
            selectableRoles: selectedRoleIds
        };

        fs.writeFileSync('./utils/rolesConfig.json', JSON.stringify(rolesConfig, null, 2));

        const roleNames = selectedRoleIds.map(roleId => {
            const role = interaction.guild.roles.cache.get(roleId);
            return role?.name || 'Unknown Role';
        });

        await interaction.reply({ 
            content: `✅ Selectable roles updated! Users can now choose from: ${roleNames.join(', ') || 'no roles'}`,
            ephemeral: true 
        });
    },
};