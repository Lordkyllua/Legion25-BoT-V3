const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const User = require('../../models/User');
const Item = require('../../models/Item');

module.exports = {
    name: 'inventory_equip',
    
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        
        if (!user || user.inventory.length === 0) {
            return await interaction.reply({ 
                content: '🎒 Your inventory is empty!', 
                ephemeral: true 
            });
        }

        // Get equipable items
        const equipableItems = [];
        for (const invItem of user.inventory) {
            const item = await Item.findOne({ itemId: invItem.itemId });
            if (item && ['weapon', 'armor', 'accessory'].includes(item.type)) {
                equipableItems.push({
                    label: item.name,
                    description: `Level ${item.levelRequirement} | ${item.type}`,
                    value: item.itemId
                });
            }
        }

        if (equipableItems.length === 0) {
            return await interaction.reply({ 
                content: '❌ No equipable items in your inventory!', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('⚡ Equip Items')
            .setDescription('Select an item to equip from your inventory')
            .setColor(0x3498DB);

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('equip_item_select')
                    .setPlaceholder('Choose an item to equip...')
                    .addOptions(equipableItems.slice(0, 25))
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};