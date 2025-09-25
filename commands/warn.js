const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user (Moderator only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true)),
  
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    
    const database = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    if (!database.warnings) database.warnings = {};
    if (!database.warnings[target.id]) database.warnings[target.id] = [];
    
    database.warnings[target.id].push({
      reason: reason,
      moderator: interaction.user.tag,
      timestamp: new Date().toISOString()
    });
    
    fs.writeFileSync('database.json', JSON.stringify(database, null, 2));
    interaction.reply(`⚠️ **${target.tag}** has been warned. Reason: ${reason}`);
  }
};