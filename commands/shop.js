const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const Item = require('../models/Item');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Browse and buy items from the shop'),
    
    async execute(interaction) {
        const categories = [
            { label: '⚔️ Weapons', value: 'weapon', description: 'Swords, staffs, bows and more' },
            { label: '🛡️ Armor', value: 'armor', description: 'Protective gear and clothing' },
            { label: '🧪 Potions', value: 'potion', description: 'Healing and buff items' },
            { label: '💎 Accessories', value: 'accessory', description: 'Rings, amulets and artifacts' },
            { label: '📦 All Items', value: 'all', description: 'Browse all available items' }
        ];

        const embed = new EmbedBuilder()
            .setTitle('🛒 Micro Hunter Shop')
            .setDescription('Welcome to the adventurer\'s shop! Browse our categories to find powerful items.')
            .setColor(0x2ECC71)
            .addFields(
                { name: '💰 Currency', value: 'All items are purchased with **Gold** earned from quests and battles', inline: false },
                { name: '🎯 Requirements', value: 'Some items require specific levels or classes to use', inline: false }
            )
            .setFooter({ text: 'Use /buy to purchase items directly' });

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('shop_category')
                    .setPlaceholder('Select a category...')
                    .addOptions(categories)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};