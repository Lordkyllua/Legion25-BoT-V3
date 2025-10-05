const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Item = require('../../models/Item');

module.exports = {
    name: 'equip_item_select',
    
    async execute(interaction) {
        const itemId = interaction.values[0];
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        
        if (!user) return;

        const item = await Item.findOne({ itemId: itemId });
        if (!item) {
            return await interaction.reply({ 
                content: '❌ Item not found!', 
                ephemeral: true 
            });
        }

        // Check requirements
        if (user.level < item.levelRequirement) {
            return await interaction.reply({ 
                content: `❌ You need level ${item.levelRequirement} to equip this item!`, 
                ephemeral: true 
            });
        }

        if (item.classRequirement && user.class.toLowerCase() !== item.classRequirement.toLowerCase()) {
            return await interaction.reply({ 
                content: `❌ This item is only for ${item.classRequirement} class!`, 
                ephemeral: true 
            });
        }

        // Equip item
        const inventoryItem = user.inventory.find(inv => inv.itemId === itemId);
        if (!inventoryItem) {
            return await interaction.reply({ 
                content: '❌ Item not found in your inventory!', 
                ephemeral: true 
            });
        }

        // Unequip current item of same type
        user.inventory.forEach(inv => {
            if (inv.equipped) {
                const equippedItem = user.inventory.find(i => i.itemId === inv.itemId);
                if (equippedItem) {
                    equippedItem.equipped = false;
                }
            }
        });

        inventoryItem.equipped = true;
        user.equipment[item.type] = itemId;

        await user.save();

        const embed = new EmbedBuilder()
            .setTitle('✅ Item Equipped!')
            .setColor(0x2ECC71)
            .addFields(
                { name: '🛡️ Item', value: item.name, inline: true },
                { name: '🎯 Type', value: item.type, inline: true },
                { name: '⭐ Rarity', value: item.rarity, inline: true }
            )
            .setFooter({ text: 'Item stats are now active' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};