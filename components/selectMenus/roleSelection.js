const fs = require('fs');

module.exports = {
  name: 'roleSelection',
  async execute(interaction) {
    const selectedRoleId = interaction.values[0];
    const member = interaction.member;
    
    try {
      const role = await interaction.guild.roles.fetch(selectedRoleId);
      if (!role) {
        return interaction.reply({ 
          content: '❌ Role not found!', 
          ephemeral: true 
        });
      }
      
      // Check if user already has the role
      if (member.roles.cache.has(selectedRoleId)) {
        await member.roles.remove(selectedRoleId);
        await interaction.reply({ 
          content: `✅ Removed the ${role.name} role!`, 
          ephemeral: true 
        });
      } else {
        await member.roles.add(selectedRoleId);
        await interaction.reply({ 
          content: `✅ Added the ${role.name} role!`, 
          ephemeral: true 
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: '❌ Error managing role!', 
        ephemeral: true 
      });
    }
  }
};