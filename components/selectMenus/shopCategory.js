const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Item = require('../../models/Item');

module.exports = {
    name: 'shop_category',
    
    async execute(interaction) {
        const category = interaction.values[0];
        
        let items;
        if (category === 'all') {
            items = await Item.find().limit(20);
        } else {
            items = await Item.find({ type: category }).limit(20);
        }

        if (items.length === 0) {
            return await interaction.reply({ 
                content: '❌ No items found in this category!', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🛒 ${category.charAt(0).toUpperCase() + category.slice(1)} Items`)
            .setColor(0x2ECC71)
            .setDescription(`Showing ${items.length} items`);

        items.forEach(item => {
            embed.addFields({
                name: `${getItemEmoji(item.type)} ${item.name} [${item.itemId}]`,
                value: `💰 ${item.price} Gold | 📊 Level ${item.levelRequirement} | ⭐ ${item.rarity}`,
                inline: false
            });
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_weapons')
                    .setLabel('Weapons')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_armor')
                    .setLabel('Armor')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('shop_potions')
                    .setLabel('Potions')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.update({ embeds: [embed], components: [row] });
    }
};

function getItemEmoji(type) {
    const emojis = {
        weapon: '⚔️',
        armor: '🛡️',
        potion: '🧪',
        accessory: '💎',
        material: '📦'
    };
    return emojis[type] || '📦';
}