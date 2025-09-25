const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleadmin')
    .setDescription('Admin panel for managing assignable roles')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const guildRoles = await interaction.guild.roles.fetch();
    const rolesConfig = JSON.parse(fs.readFileSync('./utils/rolesConfig.json', 'utf8'));
    
    const roleOptions = Array.from(guildRoles.values())
      .filter(role => role.id !== interaction.guild.id && !role.managed)
      .sort((a, b) => b.position - a.position)
      .slice(0, 25)
      .map(role => ({
        label: role.name,
        value: role.id,
        description: `Currently ${rolesConfig.assignableRoles.includes(role.id) ? 'assignable' : 'not assignable'}`,
        default: rolesConfig.assignableRoles.includes(role.id)
      }));
    
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('roleAdminSelection')
      .setPlaceholder('Select roles to make assignable...')
      .setMinValues(0)
      .setMaxValues(roleOptions.length)
      .addOptions(roleOptions);
    
    const row1 = new ActionRowBuilder().addComponents(selectMenu);
    
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('saveRoles')
        .setLabel('💾 Save Configuration')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('refreshRoles')
        .setLabel('🔄 Refresh List')
        .setStyle(ButtonStyle.Secondary)
    );
    
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Role Administration Panel')
      .setDescription('Select which roles members can assign to themselves using the `/roles` command.')
      .setColor(0xff9900)
      .addFields(
        {
          name: 'Current Assignable Roles',
          value: rolesConfig.assignableRoles.length > 0 
            ? rolesConfig.assignableRoles.map(id => {
                const role = guildRoles.get(id);
                return role ? `• ${role.name}` : '• Unknown Role';
              }).join('\n')
            : '❌ No roles configured'
        },
        {
          name: 'Instructions',
          value: '1. Select/deselect roles from the dropdown\n2. Click "Save Configuration" to apply changes\n3. Members can then use `/roles` to self-assign'
        }
      )
      .setTimestamp();

    await interaction.reply({ 
      embeds: [embed], 
      components: [row1, buttonRow],
      ephemeral: true 
    });
  }
};