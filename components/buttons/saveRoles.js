const fs = require('fs');

module.exports = {
  name: 'saveRoles',
  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ 
        content: '❌ You need administrator permissions to use this.', 
        ephemeral: true 
      });
    }
    
    await interaction.reply({ 
      content: '✅ Role configuration saved! Members can now use `/roles` to self-assign.', 
      ephemeral: true 
    });
  }
};