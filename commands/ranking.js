const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Shows the points ranking leaderboard'),
  
  async execute(interaction) {
    const points = JSON.parse(fs.readFileSync('points.json', 'utf8'));
    
    const sorted = Object.entries(points)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    if (sorted.length === 0) {
      return interaction.reply('📊 No points data available yet! Start playing to earn points.');
    }
    
    let rankingText = '';
    sorted.forEach(([userId, points], index) => {
      const user = interaction.guild.members.cache.get(userId);
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      rankingText += `${medal} ${user ? user.user.username : 'Unknown User'}: **${points}** points\n`;
    });
    
    const embed = new EmbedBuilder()
      .setTitle('🏆 Points Leaderboard - Tiny Survivors Style')
      .setColor(0xFFD700)
      .setDescription(rankingText)
      .setFooter({ 
        text: 'Climb the ranks like a true survivor! • Developed by LordK', 
        iconURL: interaction.client.user.displayAvatarURL() 
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};