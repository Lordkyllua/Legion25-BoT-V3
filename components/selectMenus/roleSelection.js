const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'role_selection',
    
    async execute(interaction) {
        const selectedRoles = interaction.values;
        
        try {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            
            // Remove all game roles first
            const gameRoles = ['Warrior', 'Mage', 'Archer', 'Novice'];
            for (const roleName of gameRoles) {
                const role = interaction.guild.roles.cache.find(r => r.name === roleName);
                if (role && member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);
                }
            }
            
            // Add selected roles
            for (const roleName of selectedRoles) {
                const role = interaction.guild.roles.cache.find(r => r.name === roleName);
                if (role) {
                    await member.roles.add(role);
                }
            }
            
            const embed = new EmbedBuilder()
                .setTitle('✅ Roles Updated')
                .setDescription(`You now have the following roles: ${selectedRoles.map(r => `**${r}**`).join(', ')}`)
                .setColor(0x2ECC71);
                
            await interaction.reply({ embeds: [embed], ephemeral: true });
            
        } catch (error) {
            await interaction.reply({ 
                content: '❌ Failed to update roles. Check bot permissions.', 
                ephemeral: true 
            });
        }
    }
};