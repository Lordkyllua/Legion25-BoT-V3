const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Fight against another player')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('The user to fight against')
        .setRequired(true)),
  
  async execute(interaction) {
    const opponent = interaction.options.getUser('opponent');
    
    if (opponent.id === interaction.user.id) {
      return interaction.reply('❌ You cannot fight yourself!');
    }
    
    if (opponent.bot) {
      return interaction.reply('❌ You cannot fight bots!');
    }
    
    const winner = Math.random() > 0.5 ? interaction.user : opponent;
    interaction.reply(`⚔️ **${interaction.user.username}** vs **${opponent.username}**\n🏆 Winner: **${winner.username}**!`);
  }
};