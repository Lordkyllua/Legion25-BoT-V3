const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Item = require('../../models/Item');

module.exports = {
    name: 'use_item_select',
    
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

        const inventoryItem = user.inventory.find(inv => inv.itemId === itemId);
        if (!inventoryItem) {
            return await interaction.reply({ 
                content: '❌ Item not found in your inventory!', 
                ephemeral: true 
            });
        }

        // Use item effects
        let effectMessage = '';
        
        if (item.health) {
            user.health = Math.min(user.maxHealth, user.health + item.health);
            effectMessage += `+${item.health} Health\n`;
        }
        
        if (item.mana) {
            user.mana = Math.min(user.maxMana, user.mana + item.mana);
            effectMessage += `+${item.mana} Mana\n`;
        }

        // Remove item from inventory
        if (inventoryItem.quantity > 1) {
            inventoryItem.quantity -= 1;
        } else {
            user.inventory = user.inventory.filter(inv => inv.itemId !== itemId);
        }

        await user.save();

        const embed = new EmbedBuilder()
            .setTitle('🧪 Item Used!')
            .setColor(0x9B59B6)
            .addFields(
                { name: '📦 Item', value: item.name, inline: true },
                { name: '⚡ Effect', value: effectMessage || 'Temporary buff applied', inline: true }
            )
            .setFooter({ text: 'Item consumed from inventory' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};