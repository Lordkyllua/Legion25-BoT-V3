const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Item = require('../models/Item');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Purchase an item from the shop')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('The item ID to purchase')
                .setRequired(true)),
    
    async execute(interaction) {
        const itemId = interaction.options.getString('item');
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        
        if (!user) {
            return await interaction.reply({ 
                content: '❌ You need to start your RPG journey first! Use `/rpg start`', 
                ephemeral: true 
            });
        }

        const item = await Item.findOne({ itemId: itemId });
        
        if (!item) {
            return await interaction.reply({ 
                content: '❌ Item not found! Use `/shop` to browse available items.', 
                ephemeral: true 
            });
        }

        if (user.gold < item.price) {
            return await interaction.reply({ 
                content: `❌ You need **${item.price - user.gold}** more gold to buy this item!`, 
                ephemeral: true 
            });
        }

        if (user.level < item.levelRequirement) {
            return await interaction.reply({ 
                content: `❌ You need to be level **${item.levelRequirement}** to buy this item!`, 
                ephemeral: true 
            });
        }

        if (item.classRequirement && user.class.toLowerCase() !== item.classRequirement.toLowerCase()) {
            return await interaction.reply({ 
                content: `❌ This item is only available for **${item.classRequirement}** class!`, 
                ephemeral: true 
            });
        }

        // Add item to inventory
        const existingItem = user.inventory.find(invItem => invItem.itemId === itemId);
        if (existingItem && item.stackable) {
            existingItem.quantity += 1;
        } else {
            user.inventory.push({
                itemId: itemId,
                quantity: 1,
                equipped: false
            });
        }

        user.gold -= item.price;
        await user.save();

        const embed = new EmbedBuilder()
            .setTitle('✅ Purchase Successful!')
            .setColor(0x2ECC71)
            .addFields(
                { name: '🛒 Item Purchased', value: `**${item.name}**`, inline: true },
                { name: '💰 Price', value: `**${item.price}** Gold`, inline: true },
                { name: '🎒 Inventory', value: `Added to your inventory! Use \`/inventory\` to view.`, inline: false }
            )
            .setFooter({ text: 'Happy hunting!' });

        await interaction.reply({ embeds: [embed] });
    }
};