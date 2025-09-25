const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tinysurvivors')
    .setDescription('Learn about the Tiny Survivors inspiration'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎮 Tiny Survivors Inspiration')
      .setColor(0xFF6B00)
      .setDescription('This bot is inspired by the amazing game **Tiny Survivors**!')
      .addFields(
        { name: '🏹 Game Concept', value: 'Survive waves of enemies, upgrade your skills, and become the ultimate survivor!' },
        { name: '🤖 Bot Features', value: '• RPG progression system\n• Clan battles\n• Survival-themed shop\n• Wave-based challenges' },
        { name: '🎯 Similar Mechanics', value: '• Level progression\n• Item collection\n• Survival challenges\n• Cooperative gameplay' }
      )
      .setFooter({ 
        text: 'Bot developed by LordK • Inspired by Tiny Survivors gameplay', 
        iconURL: interaction.client.user.displayAvatarURL() 
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};