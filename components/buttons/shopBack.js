const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const Shop = require('../../models/Shop');
const { getGold } = require('../../utils/gold');
const User = require('../../models/User');

module.exports = {
    customId: 'shop_back',
    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findById(userId);
        const userClass = user?.rpg?.class;
        
        const categories = await Shop.getCategories();
        const userGold = await getGold(userId);

        // Obtener items recomendados según la clase del usuario
        let recommendedItems = [];
        if (userClass) {
            // Items de la clase del usuario + items para todas las clases
            recommendedItems = await Shop.getItemsByClass(userClass);
            const allClassItems = await Shop.getItemsByClass('all');
            recommendedItems = [...recommendedItems, ...allClassItems];
            
            // Limitar a 8 items para no saturar
            recommendedItems = recommendedItems.slice(0, 8);
        }

        const embed = new EmbedBuilder()
            .setTitle('🏪 Legion25 Item Shop')
            .setDescription('Welcome to the shop! Browse our categories to find amazing items for your adventure.')
            .setColor(0x00AE86)
            .setThumbnail('https://i.imgur.com/VDnt46I.png')
            .addFields(
                { name: '💰 Your Gold', value: `🪙 ${userGold}`, inline: true },
                { name: '🎯 Your Class', value: userClass ? `${userClass.charAt(0).toUpperCase() + userClass.slice(1)}` : 'Not chosen', inline: true },
                { name: '📦 Categories', value: categories.map(cat => `• ${cat.charAt(0).toUpperCase() + cat.slice(1)}`).join('\n'), inline: true }
            )
            .setFooter({ text: 'Use /buy <item_id> to purchase items!' });

        // Si el usuario tiene una clase, mostrar items recomendados
        if (userClass && recommendedItems.length > 0) {
            embed.addFields({
                name: `⭐ Recommended for ${userClass.charAt(0).toUpperCase() + userClass.slice(1)}`,
                value: recommendedItems.map(item => 
                    `**${item.name}** (ID: ${item.id}) - 🪙 ${item.price}`
                ).join('\n'),
                inline: false
            });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('shop_category')
            .setPlaceholder('Choose a category to browse...')
            .addOptions(
                categories.map(category => ({
                    label: category.charAt(0).toUpperCase() + category.slice(1) + 's',
                    value: category,
                    description: `Browse ${category} items`,
                    emoji: getCategoryEmoji(category)
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.update({ embeds: [embed], components: [row] });
    },
};

function getCategoryEmoji(category) {
    const emojis = {
        weapon: '⚔️',
        armor: '🛡️',
        potion: '🧪',
        accessory: '💎',
        consumable: '🔄'
    };
    return emojis[category] || '📦';
}