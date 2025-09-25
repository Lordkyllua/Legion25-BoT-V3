const { SlashCommandBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');
const pointsUtil = require('../utils/points');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quest')
    .setDescription('Go on a quest to earn experience and points'),
  
  async execute(interaction) {
    const userId = interaction.user.id;
    const success = Math.random() > 0.3;
    
    if (success) {
      const expGained = Math.floor(Math.random() * 50) + 25;
      const pointsGained = Math.floor(Math.random() * 20) + 10;
      
      rpgUtil.addExperience(userId, expGained);
      pointsUtil.addPoints(userId, pointsGained);
      
      interaction.reply(`✅ Quest completed! Gained **${expGained} EXP** and **${pointsGained} points**!`);
    } else {
      interaction.reply('💥 Your quest failed! Better luck next time.');
    }
  }
};