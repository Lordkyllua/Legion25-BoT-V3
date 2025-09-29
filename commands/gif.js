const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gif')
        .setDescription('Get a random GIF')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search for a specific GIF')
                .setRequired(false)),
    async execute(interaction) {
        const query = interaction.options.getString('query') || 'funny';
        
        try {
            const response = await axios.get(`https://api.giphy.com/v1/gifs/random`, {
                params: {
                    api_key: 'dc6zaTOxFJmzC', // Public beta key
                    tag: query
                }
            });

            const gifUrl = response.data.data.images.original.url;

            const embed = new EmbedBuilder()
                .setTitle('🎬 Random GIF')
                .setImage(gifUrl)
                .setColor(0x9B59B6)
                .setFooter({ text: `Search: ${query} | Powered by GIPHY` });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ 
                content: 'Sorry, I couldn\'t fetch a GIF at the moment.', 
                ephemeral: true 
            });
        }
    },
};