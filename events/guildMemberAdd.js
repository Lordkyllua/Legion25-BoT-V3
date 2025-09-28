const pointsUtil = require('../utils/points');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    // Usar logger desde client
    const logger = client.logger;
    
    // Give welcome points
    pointsUtil.addPoints(member.id, 100);
    
    logger.info(`New member joined: ${member.user.tag} in ${member.guild.name}`);
    
    const welcomeChannel = member.guild.systemChannel;module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const channel = member.guild.systemChannel;
        if (channel) {
            try {
                await channel.send(`Welcome to the server, ${member}! Use \`/help\` to see what I can do. 🎉`);
            } catch (error) {
                console.error('Could not send welcome message:', error);
            }
        }
    },
};
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
        }
      )
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