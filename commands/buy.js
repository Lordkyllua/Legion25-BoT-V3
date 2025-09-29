const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { getGold, removeGold } = require('../utils/gold');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Purchase an item from the shop')
        .addIntegerOption(option =>
            option.setName('item_id')
                .setDescription('The ID of the item to buy')
                .setRequired(true)
                .setMinValue(1)),
    async execute(interaction) {
        const itemId = interaction.options.getInteger('item_id');
        const userId = interaction.user.id;
        
        try {
            const item = await Shop.getItemById(itemId);
            const userGold = await getGold(userId);
            const user = await User.findById(userId);

            if (!item) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Item Not Found')
                    .setDescription(`No item found with ID: ${itemId}`)
                    .setColor(0xFF0000)
                    .setFooter({ text: 'Use /shop to browse available items' });
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Check if user has enough gold
            if (userGold < item.price) {
                const embed = new EmbedBuilder()
                    .setTitle('💰 Insufficient Gold')
                    .setDescription(`You need 🪙 **${item.price}** but only have 🪙 **${userGold}**`)
                    .setColor(0xFFA500)
                    .addFields(
                        { name: 'Item', value: item.name, inline: true },
                        { name: 'Price', value: `🪙 ${item.price}`, inline: true }
                    );
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Check level requirement
            if (user && user.rpg && item.level > user.rpg.level) {
                const embed = new EmbedBuilder()
                    .setTitle('📈 Level Requirement')
                    .setDescription(`You need to be level **${item.level}** to purchase this item`)
                    .setColor(0xFFA500)
                    .addFields(
                        { name: 'Your Level', value: `Level ${user.rpg.level}`, inline: true },
                        { name: 'Required', value: `Level ${item.level}`, inline: true }
                    );
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Check class requirement
            if (item.class !== 'all' && user && user.rpg && item.class !== user.rpg.class) {
                const embed = new EmbedBuilder()
                    .setTitle('🎭 Class Restriction')
                    .setDescription(`This item is for **${item.class}** class only`)
                    .setColor(0xFFA500)
                    .addFields(
                        { name: 'Your Class', value: user.rpg.class, inline: true },
                        { name: 'Required', value: item.class, inline: true }
                    );
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Purchase item
            const newBalance = await removeGold(userId, item.price);
            await User.addToInventory(userId, item);

            const embed = new EmbedBuilder()
                .setTitle('🎉 Purchase Successful!')
                .setDescription(`You bought **${item.name}**`)
                .setColor(0x00FF00)
                .addFields(
                    { name: '💰 Price Paid', value: `🪙 ${item.price}`, inline: true },
                    { name: '💰 Remaining Gold', value: `🪙 ${newBalance}`, inline: true },
                    { name: '📦 Item Added', value: 'Check your `/inventory`', inline: true }
                )
                .setThumbnail('https://i.imgur.com/5R5z8Q2.png')
                .setFooter({ text: 'Use /inventory to view your new item!' });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in buy command:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('❌ Purchase Failed')
                .setDescription(error.message || 'An error occurred while processing your purchase')
                .setColor(0xFF0000);
                
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};