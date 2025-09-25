const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user (Moderator only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to mute')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('minutes')
        .setDescription('Duration in minutes')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for muting')
        .setRequired(false)),
  
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    const member = await interaction.guild.members.fetch(target.id);
    
    if (!member.moderatable) {
      return interaction.reply('❌ I cannot mute this user. They may have higher permissions.');
    }
    
    const duration = minutes * 60 * 1000; // Convert to milliseconds
    
    try {
      await member.timeout(duration, reason);
      interaction.reply(`🔇 **${target.tag}** has been muted for ${minutes} minutes. Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      interaction.reply('❌ There was an error muting this user.');
    }
  }
};