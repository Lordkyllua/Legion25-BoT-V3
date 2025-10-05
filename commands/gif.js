const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const gifCategories = {
    celebrate: [
        'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
        'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
        'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif'
    ],
    fight: [
        'https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.gif',
        'https://media.giphy.com/media/3o7aD2sN2uVWbehZvi/giphy.gif',
        'https://media.giphy.com/media/3o7TKShaO1kKvpnka4/giphy.gif'
    ],
    magic: [
        'https://media.giphy.com/media/3o7TKr3eGEnbf3gS7S/giphy.gif',
        'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
        'https://media.giphy.com/media/3o7aD2jXh0F1t96Qdy/giphy.gif'
    ],
    quest: [
        'https://media.giphy.com/media/l0MYt37MhnFwtf1kk/giphy.gif',
        'https://media.giphy.com/media/3o7TKz2eMXx4nAHqg0/giphy.gif',
        'https://media.giphy.com/media/3o7TKMt1VV26qYjs2A/giphy.gif'
    ]
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gif')
        .setDescription('Send a random RPG-themed GIF')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('GIF category')
                .setRequired(false)
                .addChoices(
                    { name: 'Celebrate', value: 'celebrate' },
                    { name: 'Fight', value: 'fight' },
                    { name: 'Magic', value: 'magic' },
                    { name: 'Quest', value: 'quest' }
                )),
    
    async execute(interaction) {
        const category = interaction.options.getString('category') || 
            Object.keys(gifCategories)[Math.floor(Math.random() * Object.keys(gifCategories).length)];
        
        const gifs = gifCategories[category];
        const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setTitle(`🎭 ${category.charAt(0).toUpperCase() + category.slice(1)} GIF`)
            .setColor(0x9B59B6)
            .setImage(randomGif)
            .setFooter({ text: 'Micro Hunter RPG - Powered by GIPHY' });

        await interaction.reply({ embeds: [embed] });
    }
};