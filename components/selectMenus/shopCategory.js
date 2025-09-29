const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Shop = require('../../models/Shop');
const User = require('../../models/User');

module.exports = {
    customId: 'shop_category',
    async execute(interaction) {
        const category = interaction.values[0];
        const userId = interaction.user.id;
        const user = await User.findById(userId);
        const userClass = user?.rpg?.class;
        
        try {
            let categoryItems = await Shop.getItemsByCategory(category);

            if (categoryItems.length === 0) {
                return await interaction.update({ 
                    content: `No items found in the ${category} category.`, 
                    components: [] 
                });
            }

            // Filtrar items por clase del usuario si es necesario
            if (userClass && category !== 'potion' && category !== 'consumable') {
                // Para armas y armaduras, mostrar items de la clase del usuario + items para todas las clases
                categoryItems = categoryItems.filter(item => 
                    item.class === userClass || item.class === 'all'
                );
            }

            if (categoryItems.length === 0) {
                return await interaction.update({ 
                    content: `No ${category} items available for your class (${userClass}).`, 
                    components: [] 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`🛒 ${category.charAt(0).toUpperCase() + category.slice(1)} Items`)
                .setColor(0x27AE60)
                .setDescription(`Available ${category} items${userClass ? ` for ${userClass}` : ''}:`)
                .setFooter({ text: 'Use /buy <item_id> to purchase an item' });

            // Mostrar items con información de clase y nivel
            const displayItems = categoryItems.slice(0, 8); // Limitar a 8 items
            
            displayItems.forEach(item => {
                const classInfo = item.class !== 'all' ? ` | Class: ${item.class}` : '';
                const levelInfo = item.level > 1 ? ` | Level: ${item.level}` : '';
                const rarityEmoji = getRarityEmoji(item.rarity);
                
                embed.addFields({
                    name: `${rarityEmoji} ${item.name} (ID: ${item.id}) - 🪙 ${item.price}`,
                    value: `${item.description}${classInfo}${levelInfo}`,
                    inline: false
                });
            });

            if (categoryItems.length > 8) {
                embed.addFields({
                    name: 'More Items',
                    value: `There are ${categoryItems.length - 8} more items in this category.`,
                    inline: false
                });
            }

            const buyButton = new ButtonBuilder()
                .setCustomId('buy_item_info')
                .setLabel('How to Buy')
                .setStyle(ButtonStyle.Success)
                .setEmoji('💰');

            const classButton = new ButtonBuilder()
                .setCustomId('shop_other_classes')
                .setLabel('Show All Classes')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('👥');

            const row = new ActionRowBuilder().addComponents(buyButton, classButton);

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

function getRarityEmoji(rarity) {
    const emojis = {
        common: '⚪',
        uncommon: '🟢',
        rare: '🔵',
        epic: '🟣',
        legendary: '🟡'
    };
    return emojis[rarity] || '⚪';
}