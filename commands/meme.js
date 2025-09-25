const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme from Reddit'),
  
  async execute(interaction) {
    try {
      const response = await axios.get('https://meme-api.com/gimme');
      const meme = response.data;
      
      const embed = new EmbedBuilder()
        .setTitle(meme.title)
        .setURL(meme.postLink)
        .setImage(meme.url)
        .setColor(0x0099ff)
        .setFooter({ text: `From r/${meme.subreddit} • Bot developed by LordK` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply('❌ Sorry, I couldn\'t fetch a meme right now.');
    }
  }
};