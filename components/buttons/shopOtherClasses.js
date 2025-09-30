const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Shop = require('../../models/Shop');

module.exports = {
    customId: 'shop_other_classes',
    async execute(interaction) {
        try {
            // Obtener la categoría del mensaje original - método mejorado
            const originalEmbed = interaction.message.embeds[0];
            let category = null;
            
            // Buscar la categoría en los fields del embed original
            if (originalEmbed && originalEmbed.fields) {
                for (const field of originalEmbed.fields) {
                    if (field.name && field.name.toLowerCase().includes('items')) {
                        // Extraer categoría del nombre del field
                        const fieldName = field.name.toLowerCase();
                        if (fieldName.includes('weapon')) category = 'weapon';
                        else if (fieldName.includes('armor')) category = 'armor';
                        else if (fieldName.includes('accessory')) category = 'accessory';
                        else if (fieldName.includes('potion')) category = 'potion';
                        else if (fieldName.includes('consumable')) category = 'consumable';
                        break;
                    }
                }
            }
            
            // Si no se encontró en los fields, intentar del título
            if (!category && originalEmbed && originalEmbed.title) {
                const title = originalEmbed.title.toLowerCase();
                if (title.includes('weapon')) category = 'weapon';
                else if (title.includes('armor')) category = 'armor';
                else if (title.includes('accessory')) category = 'accessory';
                else if (title.includes('potion')) category = 'potion';
                else if (title.includes('consumable')) category = 'consumable';
            }

            // Si aún no se encuentra, usar valor por defecto
            if (!category) {
                category = 'weapon';
            }

            console.log(`Loading ${category} items for all classes...`);

            const categoryItems = await Shop.getItemsByCategory(category);

            if (categoryItems.length === 0) {
                return await interaction.update({ 
                    content: `No items found in the ${category} category.`, 
                    components: [] 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`👥 All Classes - ${category.charAt(0).toUpperCase() + category.slice(1)} Items`)
                .setColor(0x3498DB)
                .setDescription(`Showing all ${category} items for all classes:`)
                .setFooter({ text: 'Use /buy <item_id> to purchase an item' });

            // Agrupar items por clase
            const classGroups = {
                mage: { items: [], emoji: '🔮' },
                warrior: { items: [], emoji: '⚔️' },
                archer: { items: [], emoji: '🏹' },
                all: { items: [], emoji: '👥' }
            };

            // Organizar items por clase
            categoryItems.forEach(item => {
                if (classGroups[item.class]) {
                    classGroups[item.class].items.push(item);
                }
            });

            let hasItems = false;

            // Mostrar items por clase
            for (const [classType, group] of Object.entries(classGroups)) {
                if (group.items.length > 0) {
                    hasItems = true;
                    const classDisplay = classType === 'all' ? 'All Classes' : 
                                        classType.charAt(0).toUpperCase() + classType.slice(1);
                    
                    // Ordenar items por nivel y precio
                    const sortedItems = group.items.sort((a, b) => a.level - b.level || a.price - b.price);
                    const displayItems = sortedItems.slice(0, 4);
                    
                    const itemList = displayItems.map(item => 
                        `${getRarityEmoji(item.rarity)} **${item.name}** (ID: ${item.id})\n🪙 ${item.price} | Level ${item.level}`
                    ).join('\n\n');
                    
                    const moreText = group.items.length > 4 ? `\n\n*...and ${group.items.length - 4} more*` : '';
                    
                    embed.addFields({
                        name: `${group.emoji} ${classDisplay} (${group.items.length})`,
                        value: itemList + moreText,
                        inline: false
                    });
                }
            }

            if (!hasItems) {
                return await interaction.update({ 
                    content: `No items available in ${category} category for any class.`, 
                    components: [] 
                });
            }

            const buyButton = new ButtonBuilder()
                .setCustomId('buy_item_info')
                .setLabel('How to Buy')
                .setStyle(ButtonStyle.Success)
                .setEmoji('💰');

            const backButton = new ButtonBuilder()
                .setCustomId('shop_back')
                .setLabel('Back to Shop')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('↩️');

            const row = new ActionRowBuilder().addComponents(buyButton, backButton);

            await interaction.update({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Error showing other classes:', error);
            await interaction.reply({ 
                content: 'An error occurred while loading items. Please try using `/shop` again.', 
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