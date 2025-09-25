const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Get a random inspirational quote'),
  
  async execute(interaction) {
    try {
      const response = await axios.get('https://api.quotable.io/random');
      const quote = response.data;
      
      const embed = new EmbedBuilder()
        .setTitle('💬 Inspirational Quote')
        .setDescription(`"${quote.content}"`)
        .setColor(0x00FF00)
        .addFields(
          { name: 'Author', value: quote.author, inline: true },
          { name: 'Tags', value: quote.tags.join(', ') || 'None', inline: true }
        )
        .setFooter({ text: 'Bot developed by LordK' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply('❌ Sorry, I couldn\'t fetch a quote right now.');
    }
  }
};