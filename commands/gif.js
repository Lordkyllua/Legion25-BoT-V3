const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gif')
    .setDescription('Search for a GIF')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('What to search for')
        .setRequired(true)),
  
  async execute(interaction) {
    const query = interaction.options.getString('query');
    
    try {
      // Note: You'll need a GIPHY API key for this to work
      const response = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=YOUR_API_KEY&q=${encodeURIComponent(query)}&limit=1`);
      
      if (response.data.data.length === 0) {
        return interaction.reply('❌ No GIFs found for that query.');
      }
      
      const gif = response.data.data[0];
      const embed = new EmbedBuilder()
        .setTitle(`GIF: ${query}`)
        .setImage(gif.images.original.url)
        .setColor(0x0099ff)
        .setFooter({ text: 'Powered by GIPHY • Bot developed by LordK' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply('❌ Sorry, I couldn\'t fetch a GIF right now. API key may need configuration.');
    }
  }
};