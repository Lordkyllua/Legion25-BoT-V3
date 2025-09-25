const pointsUtil = require('../utils/points');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client, logger) {
    // Give welcome points
    pointsUtil.addPoints(member.id, 100);
    
    logger.info(`New member joined: ${member.user.tag} in ${member.guild.name}`);
    
    const welcomeChannel = member.guild.systemChannel;
    if (!welcomeChannel) return;

    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle('🎉 Welcome to the Survival Community!')
      .setDescription(`We're thrilled to have you, ${member.user.username}!`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        {
          name: '🎁 Starter Gift',
          value: 'You received **100 survival points** to get started!',
          inline: true
        },
        {
          name: '⚔️ Get Started',
          value: 'Use `/help` to see all available commands and begin your adventure!',
          inline: true
        },
        {
          name: '🌊 Survival Tips',
          value: '• Use `/rpg` to start your character\n• Check `/shop` for useful items\n• Join clans for team survival'
        }
      )
      .setImage('https://i.imgur.com/3Q3R4x2.png')
      .setFooter({
        text: 'Survivor Bot • Developed by LordK • Inspired by Tiny Survivors',
        iconURL: client.user.displayAvatarURL()
      })
      .setTimestamp();

    try {
      await welcomeChannel.send({ 
        content: `👋 Welcome ${member.user}!`,
        embeds: [welcomeEmbed] 
      });
    } catch (error) {
      logger.warning(`Could not send welcome message in ${member.guild.name}`);
    }
  }
};
