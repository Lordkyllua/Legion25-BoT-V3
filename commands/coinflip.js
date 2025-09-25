const { SlashCommandBuilder } = require('discord.js');
const pointsUtil = require('../utils/points');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin and bet points')
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('Choose heads or tails')
        .setRequired(true)
        .addChoices(
          { name: 'Heads', value: 'heads' },
          { name: 'Tails', value: 'tails' }
        ))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of points to bet')
        .setRequired(true)
        .setMinValue(1)),
  
  async execute(interaction) {
    const choice = interaction.options.getString('choice');
    const amount = interaction.options.getInteger('amount');
    const userId = interaction.user.id;
    
    const currentPoints = pointsUtil.getPoints(userId);
    if (currentPoints < amount) {
      return interaction.reply(`❌ You don't have enough points! You have ${currentPoints} but need ${amount}.`);
    }
    
    const result = Math.random() > 0.5 ? 'heads' : 'tails';
    const won = choice === result;
    
    if (won) {
      pointsUtil.addPoints(userId, amount);
      interaction.reply(`🎉 It was **${result}**! You won **${amount}** points!`);
    } else {
      pointsUtil.removePoints(userId, amount);
      interaction.reply(`💸 It was **${result}**! You lost **${amount}** points.`);
    }
  }
};