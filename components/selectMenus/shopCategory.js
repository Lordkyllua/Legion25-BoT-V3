const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Shop = require('../../models/Shop');

module.exports = {
    customId: 'shop_category',
    async execute(interaction) {
        const category = interaction.values[0];
        
        try {
            const categoryItems = await Shop.getItemsByCategory(category);

            if (categoryItems.length === 0) {
                return await interaction.update({ 
                    content: `No items found in the ${category} category.`, 
                    components: [] 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`🛒 ${category.charAt(0).toUpperCase() + category.slice(1)} Items`)
                .setColor(0x27AE60)
                .setDescription(`Available ${category} items:`)
                .setFooter({ text: 'Use /buy <item_id> to purchase an item' });

            // Show first 5 items to avoid embed limits
            const displayItems = categoryItems.slice(0, 5);
            
            displayItems.forEach(item => {
                const classRequirement = item.class !== 'all' ? ` | Class: ${item.class}` : '';
                const levelRequirement = item.level > 1 ? ` | Level: ${item.level}` : '';
                
                embed.addFields({
                    name: `${item.name} (ID: ${item.id}) - 🪙 ${item.price}`,
                    value: `${item.description}${classRequirement}${levelRequirement}`,
                    inline: false
                });
            });

            if (categoryItems.length > 5) {
                embed.addFields({
                    name: 'More Items',
                    value: `There are ${categoryItems.length - 5} more items in this category.`,
                    inline: false
                });
            }

            const buyButton = new ButtonBuilder()
                .setCustomId('buy_item_info')
                .setLabel('How to Buy')
                .setStyle(ButtonStyle.Success)
                .setEmoji('💰');

            const row = new ActionRowBuilder().addComponents(buyButton);

            await interaction.update({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Error in shop category:', error);
            await interaction.reply({ 
                content: 'An error occurred while loading items.', 
                ephemeral: true 
            });
        }
    },
};