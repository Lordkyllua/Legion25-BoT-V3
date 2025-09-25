module.exports = {
  name: 'refreshRoles',
  async execute(interaction, client) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ 
        content: '❌ You need administrator permissions to use this.', 
        ephemeral: true 
      });
    }
    
    // Re-execute the roleadmin command
    const roleadminCommand = client.commands.get('roleadmin');
    if (roleadminCommand) {
      await roleadminCommand.execute(interaction);
    }
  }
};