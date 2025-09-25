const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Interactive role selection menu'),
  
  async execute(interaction) {
    const rolesConfig = JSON.parse(fs.readFileSync('./utils/rolesConfig.json', 'utf8'));
    const assignableRoles = rolesConfig.assignableRoles || [];
    
    if (assignableRoles.length === 0) {
      return interaction.reply({ 
        content: '❌ No roles are currently available for self-assignment. Admins can configure this with `/roleadmin`.', 
        ephemeral: true 
      });
    }
    
    const roleOptions = [];
    for (const roleId of assignableRoles) {
      const role = await interaction.guild.roles.fetch(roleId);
      if (role) {
        roleOptions.push({
          label: role.name,
          value: roleId,
          description: `Click to add/remove ${role.name} role`
        });
      }
    }
    
    if (roleOptions.length === 0) {
      return interaction.reply({ 
        content: '❌ No valid roles found. Admins may need to reconfigure assignable roles.', 
        ephemeral: true 
      });
    }
    
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('roleSelection')
      .setPlaceholder('Choose roles to add/remove...')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(roleOptions);
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    const embed = new EmbedBuilder()
      .setTitle('🎭 Role Selection')
      .setDescription('Use the dropdown below to add or remove roles from yourself:')
      .setColor(0x0099ff)
      .addFields(
        {
          name: 'Available Roles',
          value: roleOptions.map(opt => `• ${opt.label}`).join('\n')
        }
      );

    await interaction.reply({ 
      embeds: [embed], 
      components: [row],
      ephemeral: true 
    });
  }
};