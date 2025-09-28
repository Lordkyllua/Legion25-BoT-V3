const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Browse the magical item shop'),
    async execute(interaction) {
        const store = JSON.parse(fs.readFileSync('./store.json', 'utf8'));
        const categories = [...new Set(store.items.map(item => item.type))];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('shop_category')
            .setPlaceholder('Choose a category to browse...')
            .addOptions(
                categories.map(category => ({
                    label: category.charAt(0).toUpperCase() + category.slice(1) + 's',
                    value: category,
                    description: `Browse ${category} items`,
                    emoji: getCategoryEmoji(category)
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setTitle('🏪 Magical Item Shop')
            .setDescription('Welcome to the shop! Browse our categories to find amazing items for your adventure.')
            .setColor(0x00AE86)
            .setThumbnail('https://i.imgur.com/3JQ4p7p.png')
            .addFields(
                { name: '💰 Your Gold', value: `🪙 ${getUserGold(interaction.user.id)}`, inline: true },
                { name: '📦 Categories', value: categories.map(cat => `• ${cat.charAt(0).toUpperCase() + cat.slice(1)}`).join('\n'), inline: true }
            )
            .setFooter({ text: 'Use /buy <item_id> to purchase items!' });

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};

function getCategoryEmoji(category) {
    const emojis = {
        weapon: '⚔️',
        armor: '🛡️',
        potion: '🧪',
        shield: '🔰',
        accessory: '💎'
    };
    return emojis[category] || '📦';
}

function getUserGold(userId) {
    const gold = JSON.parse(fs.readFileSync('./gold.json', 'utf8'));
    return gold[userId] || 0;
}