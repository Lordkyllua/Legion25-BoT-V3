const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Shop = require('../../models/Shop');

module.exports = {
    customId: 'shop_other_classes',
    async execute(interaction) {
        const originalEmbed = interaction.message.embeds[0];
        const category = originalEmbed.title.toLowerCase().replace(' items', '');
        
        try {
            const categoryItems = await Shop.getItemsByCategory(category);

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

            for (const [classType, items] of Object.entries(classes)) {
                if (items.length > 0) {
                    const classDisplay = classType === 'all' ? 'All Classes' : 
                                        classType.charAt(0).toUpperCase() + classType.slice(1);
                    
                    const itemList = items.slice(0, 3).map(item => 
                        `**${item.name}** (ID: ${item.id}) - 🪙 ${item.price}`
                    ).join('\n');
                    
                    const moreText = items.length > 3 ? `\n...and ${items.length - 3} more` : '';
                    
                    embed.addFields({
                        name: `${getClassEmoji(classType)} ${classDisplay}`,
                        value: itemList + moreText,
                        inline: true
                    });
                }
            }

            const buyButton = new ButtonBuilder()
                .setCustomId('buy_item_info')
                .setLabel('How to Buy')
                .setStyle(ButtonStyle.Success)
                .setEmoji('💰');

            const backButton = new ButtonBuilder()
                .setCustomId('shop_back')
                .setLabel('Back to My Class')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('↩️');

            const row = new ActionRowBuilder().addComponents(buyButton, backButton);

            await interaction.update({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Error showing other classes:', error);
            await interaction.reply({ 
                content: 'An error occurred while loading items.', 
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