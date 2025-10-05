const { EmbedBuilder } = require('discord.js');
const Item = require('../../models/Item');

module.exports = {
    name: 'buy_item_',
    
    async execute(interaction) {
        const itemId = interaction.customId.replace('buy_item_', '');
        const item = await Item.findOne({ itemId: itemId });

        if (!item) {
            return await interaction.reply({ 
                content: '❌ Item not found!', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🛒 ${item.name}`)
            .setDescription(item.description)
            .setColor(0xF39C12)
            .addFields(
                { name: '💰 Price', value: `${item.price} Gold`, inline: true },
                { name: '📊 Level Req', value: `Level ${item.levelRequirement}`, inline: true },
                { name: '🎯 Type', value: item.type.charAt(0).toUpperCase() + item.type.slice(1), inline: true },
                { name: '⭐ Rarity', value: item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1), inline: true }
            );

        if (item.strength > 0) embed.addFields({ name: '💪 Strength', value: `+${item.strength}`, inline: true });
        if (item.intelligence > 0) embed.addFields({ name: '🧠 Intelligence', value: `+${item.intelligence}`, inline: true });
        if (item.agility > 0) embed.addFields({ name: '⚡ Agility', value: `+${item.agility}`, inline: true });
        if (item.defense > 0) embed.addFields({ name: '🛡️ Defense', value: `+${item.defense}`, inline: true });

        embed.setFooter({ text: `Use /buy ${itemId} to purchase this item` });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};