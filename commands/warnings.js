const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check warnings for')
        .setRequired(true)),
  
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const database = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    
    if (!database.warnings || !database.warnings[target.id] || database.warnings[target.id].length === 0) {
      return interaction.reply(`✅ **${target.tag}** has no warnings.`);
    }
    
    const warnings = database.warnings[target.id];
    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Warnings for ${target.tag}`)
      .setColor(0xFFA500)
      .setDescription(`Total warnings: ${warnings.length}`)
      .addFields(
        warnings.map((warning, index) => ({
          name: `Warning #${index + 1}`,
          value: `Reason: ${warning.reason}\nModerator: ${warning.moderator}\nDate: ${new Date(warning.timestamp).toLocaleDateString()}`,
          inline: false
        }))
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};