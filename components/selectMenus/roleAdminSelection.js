const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'role_admin_selection',
    
    async execute(interaction) {
        const selectedRoleId = interaction.values[0];
        const role = await interaction.guild.roles.fetch(selectedRoleId);
        
        if (!role) {
            return await interaction.reply({ 
                content: '❌ Role not found!', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎭 Role Information')
            .setColor(role.color)
            .addFields(
                { name: 'Role Name', value: role.name, inline: true },
                { name: 'Role ID', value: role.id, inline: true },
                { name: 'Color', value: role.hexColor, inline: true },
                { name: 'Members', value: `${role.members.size} members`, inline: true },
                { name: 'Position', value: `${role.position}`, inline: true },
                { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: 'Role management' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};