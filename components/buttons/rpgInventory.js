const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

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

        // Group items by type
        const itemsByType = {};
        user.inventory.forEach(invItem => {
            if (!itemsByType[invItem.type]) itemsByType[invItem.type] = [];
            itemsByType[invItem.type].push(invItem);
        });

        Object.entries(itemsByType).forEach(([type, items]) => {
            embed.addFields({
                name: `📦 ${type.charAt(0).toUpperCase() + type.slice(1)} (${items.length})`,
                value: items.map(item => `${item.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}`).join('\n') || 'None',
                inline: true
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};