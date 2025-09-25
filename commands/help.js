const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Discover all the amazing features of Survivor Bot!'),
  
  async execute(interaction) {
    const commandCategories = {
      '🎮 RPG System': ['rpg', 'quest', 'fight', 'tinysurvivors'],
      '🛍️ Economy': ['shop', 'buy', 'inventory', 'ranking', 'coinflip'],
      '👥 Social': ['roles', 'clan', 'createclan', 'joinclan'],
      '🛡️ Moderation': ['warn', 'warnings', 'mute'],
      '🎉 Fun': ['meme', 'quote', 'gif']
    };

    const helpEmbed = new EmbedBuilder()
      .setColor(0x6a0dad)
      .setTitle('🌟 Survivor Bot - Command Center')
      .setDescription('Welcome to your survival adventure! Here are all the commands to enhance your experience:')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setImage('https://i.imgur.com/5D4z8x2.png')
      .addFields(
        Object.entries(commandCategories).map(([category, commands]) => ({
          name: `${category}`,
          value: commands.map(cmd => `\`/${cmd}\``).join(' • ') || 'Coming soon...',
          inline: false
        }))
      )
      .addFields({
        name: '💫 Quick Start',
        value: '1. Use `/rpg` to create your character\n2. Check `/shop` for survival gear\n3. Try `/quest` for your first adventure!\n4. Use `/roles` to customize your identity'
      })
      .setFooter({
        text: 'Survivor Bot • Developed with 💜 by LordK • Inspired by Tiny Survivors',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    const supportButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🎮 Tiny Survivors')
        .setStyle(ButtonStyle.Link)
        .setURL('https://store.steampowered.com/app/2171440/Tiny_Survivors/'),
      new ButtonBuilder()
        .setLabel('⭐ Rate Bot')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('rate_bot')
        .setEmoji('⭐')
    );

    await interaction.reply({ 
      embeds: [helpEmbed], 
      components: [supportButton] 
    });
  }
};
