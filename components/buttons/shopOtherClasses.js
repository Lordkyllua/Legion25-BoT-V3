const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Shop = require('../../models/Shop');

module.exports = {
    customId: 'shop_other_classes',
    async execute(interaction) {
        try {
            // Obtener la categoría del mensaje original de manera más robusta
            const originalEmbed = interaction.message.embeds[0];
            let category = 'weapon'; // Valor por defecto
            
            // Extraer la categoría del título del embed
            if (originalEmbed && originalEmbed.title) {
                const title = originalEmbed.title.toLowerCase();
                if (title.includes('weapon')) category = 'weapon';
                else if (title.includes('armor')) category = 'armor';
                else if (title.includes('accessory')) category = 'accessory';
                else if (title.includes('potion')) category = 'potion';
                else if (title.includes('consumable')) category = 'consumable';
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

            // Mostrar items agrupados por clase
            const classes = {
                mage: categoryItems.filter(item => item.class === 'mage'),
                warrior: categoryItems.filter(item => item.class === 'warrior'),
                archer: categoryItems.filter(item => item.class === 'archer'),
                all: categoryItems.filter(item => item.class === 'all')
            };

            let hasItems = false;

            for (const [classType, items] of Object.entries(classes)) {
                if (items.length > 0) {
                    hasItems = true;
                    const classDisplay = classType === 'all' ? 'All Classes' : 
                                        classType.charAt(0).toUpperCase() + classType.slice(1);
                    
                    const itemList = items.slice(0, 4).map(item => 
                        `${getRarityEmoji(item.rarity)} **${item.name}** (ID: ${item.id})\n🪙 ${item.price} | Level: ${item.level}`
                    ).join('\n\n');
                    
                    const moreText = items.length > 4 ? `\n\n*...and ${items.length - 4} more*` : '';
                    
                    embed.addFields({
                        name: `${getClassEmoji(classType)} ${classDisplay} (${items.length})`,
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

function getClassEmoji(className) {
    const emojis = {
        mage: '🔮',
        warrior: '⚔️',
        archer: '🏹',
        all: '👥'
    };
    return emojis[className] || '📦';
}

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