const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    customId: 'rpg_inventory',
    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findById(userId);

        if (!user || !user.rpg || !user.rpg.inventory || user.rpg.inventory.length === 0) {
            await interaction.reply({ 
                content: 'Your inventory is empty! Visit the shop with `/shop` to buy items.', 
                ephemeral: true 
            });
            return;
        }

        const inventory = user.rpg.inventory;
        const embed = new EmbedBuilder()
            .setTitle(`🎒 ${interaction.user.username}'s Inventory`)
            .setColor(0x27AE60)
            .setDescription(`You have **${inventory.length}** items`)
            .setFooter({ text: 'Use /buy to get more items!' });

        // Show items (limit to 10 to avoid embed limits)
        const displayItems = inventory.slice(0, 10);
        
        displayItems.forEach(item => {
            embed.addFields({
                name: `${item.name} (ID: ${item.id})`,
                value: `💰 Price: 🪙 ${item.price}\n📝 ${item.description}\n🎯 Type: ${item.type} | Level: ${item.level}`,
                inline: false
            });
        });

        if (inventory.length > 10) {
            embed.addFields({
                name: 'More Items',
                value: `You have ${inventory.length - 10} more items in your inventory.`,
                inline: false
            });
        }

        await interaction.reply({ 
            embeds: [embed], 
            ephemeral: true 
        });
    },
};