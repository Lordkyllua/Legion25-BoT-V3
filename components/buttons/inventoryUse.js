const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const User = require('../../models/User');
const Item = require('../../models/Item');

module.exports = {
    name: 'inventory_use',
    
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        
        if (!user || user.inventory.length === 0) {
            return await interaction.reply({ 
                content: '🎒 Your inventory is empty!', 
                ephemeral: true 
            });
        }

        // Get usable items (potions, consumables)
        const usableItems = [];
        for (const invItem of user.inventory) {
            const item = await Item.findOne({ itemId: invItem.itemId });
            if (item && item.consumable) {
                usableItems.push({
                    label: item.name,
                    description: `x${invItem.quantity} | ${item.effect}`,
                    value: item.itemId
                });
            }
        }

        if (usableItems.length === 0) {
            return await interaction.reply({ 
                content: '❌ No usable items in your inventory!', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🧪 Use Items')
            .setDescription('Select an item to use from your inventory')
            .setColor(0x2ECC71);

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('use_item_select')
                    .setPlaceholder('Choose an item to use...')
                    .addOptions(usableItems.slice(0, 25))
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};