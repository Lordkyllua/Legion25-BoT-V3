const fs = require('fs');

module.exports = {
  name: 'roleAdminSelection',
  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ 
        content: '❌ You need administrator permissions to use this.', 
        ephemeral: true 
      });
    }
    
    const selectedRoleIds = interaction.values;
    const rolesConfig = JSON.parse(fs.readFileSync('./utils/rolesConfig.json', 'utf8'));
    
    // Update assignable roles
    rolesConfig.assignableRoles = selectedRoleIds;
    fs.writeFileSync('./utils/rolesConfig.json', JSON.stringify(rolesConfig, null, 2));
    
    await interaction.reply({ 
      content: `✅ Updated assignable roles! Selected ${selectedRoleIds.length} roles. Don't forget to save!`, 
      ephemeral: true 
    });
  }
};