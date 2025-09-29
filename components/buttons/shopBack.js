const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const Shop = require('../../models/Shop');
const User = require('../../models/User');

module.exports = {
    customId: 'shop_back',
    async execute(interaction) {
        // Simplemente volver a ejecutar el comando /shop
        const { client } = interaction;
        const shopCommand = client.commands.get('shop');
        
        if (shopCommand) {
            await shopCommand.execute(interaction);
        } else {
            await interaction.reply({ 
                content: 'Could not return to shop. Please use /shop again.', 
                ephemeral: true 
            });
        }
    },
};