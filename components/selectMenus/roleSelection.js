const fs = require('fs');

module.exports = {
    customId: 'role_selection',
    async execute(interaction) {
        const selectedRoleIds = interaction.values;
        const member = interaction.member;

        try {
            // Remove all selectable roles first
            const rolesConfig = JSON.parse(fs.readFileSync('./utils/rolesConfig.json', 'utf8'));
            const currentRoles = member.roles.cache;
            
            for (const roleId of rolesConfig.selectableRoles) {
                if (currentRoles.has(roleId)) {
                    await member.roles.remove(roleId);
                }
            }

            // Add selected roles
            for (const roleId of selectedRoleIds) {
                await member.roles.add(roleId);
            }

            const roleNames = selectedRoleIds.map(roleId => {
                const role = interaction.guild.roles.cache.get(roleId);
                return role?.name || 'Unknown Role';
            });

            await interaction.reply({ 
                content: `✅ Your roles have been updated! You now have: ${roleNames.join(', ') || 'no roles'}`,
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'There was an error updating your roles. Please contact an administrator.', 
                ephemeral: true 
            });
        }
    },
};