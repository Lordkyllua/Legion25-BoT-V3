const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');
const Item = require('../models/Item');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your inventory and equipped items'),
    
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        
        if (!user) {
            return await interaction.reply({ 
                content: '❌ You need to start your RPG journey first! Use `/rpg start`', 
                ephemeral: true 
            });
        }

        if (user.inventory.length === 0) {
            return await interaction.reply({ 
                content: '🎒 Your inventory is empty! Visit the shop with `/shop` to buy items.', 
                ephemeral: true 
            });
        }

        // Get item details for all inventory items
        const inventoryDetails = await Promise.all(
            user.inventory.map(async invItem => {
                const item = await Item.findOne({ itemId: invItem.itemId });
                return {
                    ...invItem,
                    details: item
                };
            })
        );

        const embed = new EmbedBuilder()
            .setTitle(`🎒 ${interaction.user.username}'s Inventory`)
            .setColor(0x9B59B6)
            .setDescription(`**Gold:** ${user.gold} 🪙\n**Items:** ${user.inventory.length}`);

        // Add equipped items section
        const equippedItems = inventoryDetails.filter(item => item.equipped);
        if (equippedItems.length > 0) {
            embed.addFields({
                name: '⚡ Equipped Items',
                value: equippedItems.map(item => 
                    `${item.details.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}`
                ).join('\n') || 'None'
            });
        }

        // Add inventory items section
        const unequippedItems = inventoryDetails.filter(item => !item.equipped);
        if (unequippedItems.length > 0) {
            const inventoryText = unequippedItems.slice(0, 10).map(item => 
                `${item.details.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}`
            ).join('\n');
            
            embed.addFields({
                name: `📦 Inventory (${unequippedItems.length} items)`,
                value: inventoryText + (unequippedItems.length > 10 ? `\n...and ${unequippedItems.length - 10} more` : '')
            });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('inventory_equip')
                    .setLabel('Equip Items')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('inventory_use')
                    .setLabel('Use Items')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('inventory_sell')
                    .setLabel('Sell Items')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};