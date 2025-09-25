const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rpg')
    .setDescription('Start your RPG adventure - Tiny Survivors style'),
  
  async execute(interaction) {
    const userId = interaction.user.id;
    const userProfile = rpgUtil.getUserProfile(userId);
    
    const embed = new EmbedBuilder()
      .setTitle(`⚔️ ${interaction.user.username}'s Survivor Profile`)
      .setColor(0x00FF00)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: '🏹 Level', value: userProfile.level.toString(), inline: true },
        { name: '⭐ Experience', value: `${userProfile.exp}/${userProfile.expToNextLevel}`, inline: true },
        { name: '❤️ Health', value: userProfile.health.toString(), inline: true },
        { name: '💰 Gold', value: userProfile.gold.toString(), inline: true },
        { name: '🛡️ Class', value: userProfile.class, inline: true },
        { name: '🎯 Next Goal', value: `Reach level ${userProfile.level + 1}`, inline: true }
      )
      .setFooter({ 
        text: 'Survive and thrive in this Tiny Survivors adventure! • Developed by LordK', 
        iconURL: interaction.client.user.displayAvatarURL() 
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};