const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your inventory and equipment'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findById(userId);

        if (!user || !user.rpg || !user.rpg.inventory || user.rpg.inventory.length === 0) {
            return await interaction.reply({ 
                content: 'Your inventory is empty! Visit the shop with `/shop` to buy items.', 
                ephemeral: true 
            });
        }

        const inventory = user.rpg.inventory;
        const equipped = user.rpg.equipped || {};

        const embed = new EmbedBuilder()
            .setTitle(`🎒 ${interaction.user.username}'s Inventory`)
            .setColor(0x27AE60)
            .setDescription(`You have **${inventory.length}** items in your inventory`)
            .setThumbnail(interaction.user.displayAvatarURL());

        // Show equipped items
        if (equipped.weapon || equipped.armor || equipped.accessory) {
            let equippedText = '';
            if (equipped.weapon) equippedText += `⚔️ **Weapon**: ${equipped.weapon.name}\n`;
            if (equipped.armor) equippedText += `🛡️ **Armor**: ${equipped.armor.name}\n`;
            if (equipped.accessory) equippedText += `💎 **Accessory**: ${equipped.accessory.name}\n`;
            
            embed.addFields({
                name: '🎯 Equipped Items',
                value: equippedText || 'No items equipped',
                inline: false
            });
        }

        // Show inventory items (first 10 items)
        const displayItems = inventory.slice(0, 10);
        let inventoryText = '';
        
        displayItems.forEach((item, index) => {
            const equippedIndicator = (equipped.weapon?.id === item.id || equipped.armor?.id === item.id || equipped.accessory?.id === item.id) ? ' ✅' : '';
            inventoryText += `**${item.name}** (ID: ${item.id}) - 🪙 ${item.price}${equippedIndicator}\n`;
            inventoryText += `*${item.description}*\n\n`;
        });

        if (inventory.length > 10) {
            inventoryText += `\n...and ${inventory.length - 10} more items`;
        }

        embed.addFields({
            name: `📦 Inventory Items ${inventory.length > 0 ? `(${inventory.length})` : ''}`,
            value: inventoryText || 'No items in inventory',
            inline: false
        });

        const equipButton = new ButtonBuilder()
            .setCustomId('inventory_equip')
            .setLabel('Manage Equipment')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⚔️');

        const useButton = new ButtonBuilder()
            .setCustomId('inventory_use')
            .setLabel('Use Items')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🧪');

        const row = new ActionRowBuilder().addComponents(equipButton, useButton);

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};