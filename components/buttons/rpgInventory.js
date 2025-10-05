const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Item = require('../../models/Item');

module.exports = {
    name: 'rpg_inventory',
    
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        
        if (!user || user.inventory.length === 0) {
            return await interaction.reply({ 
                content: '🎒 Your inventory is empty!', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎒 ${interaction.user.username}'s RPG Inventory`)
            .setColor(0x9B59B6)
            .setDescription(`**Gold:** ${user.gold} 🪙\n**Items:** ${user.inventory.length}`);

        // Obtener detalles de todos los items
        const inventoryDetails = [];
        for (const invItem of user.inventory) {
            const item = await Item.findOne({ itemId: invItem.itemId });
            if (item) {
                inventoryDetails.push({
                    ...invItem.toObject(),
                    details: item
                });
            }
        }

        // Agrupar por tipo
        const itemsByType = {};
        inventoryDetails.forEach(item => {
            const type = item.details.type;
            if (!itemsByType[type]) itemsByType[type] = [];
            itemsByType[type].push(item);
        });

        Object.entries(itemsByType).forEach(([type, items]) => {
            const itemList = items.map(item => 
                `${item.details.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}${item.equipped ? ' ⚡' : ''}`
            ).join('\n') || 'None';
            
            embed.addFields({
                name: `📦 ${type.charAt(0).toUpperCase() + type.slice(1)} (${items.length})`,
                value: itemList.length > 1024 ? itemList.substring(0, 1020) + '...' : itemList,
                inline: true
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};