const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'buy_item_info',
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('💰 How to Buy Items')
            .setColor(0x3498DB)
            .setDescription('Here\'s how to purchase items from the shop:')
            .addFields(
                {
                    name: '🛒 Step 1: Browse Items',
                    value: 'Use `/shop` to browse available items by category',
                    inline: false
                },
                {
                    name: '🔍 Step 2: Note the Item ID',
                    value: 'Each item has an ID number next to its name',
                    inline: false
                },
                {
                    name: '💳 Step 3: Purchase Command',
                    value: 'Use `/buy <item_id>` to purchase an item\nExample: `/buy 1`',
                    inline: false
                },
                {
                    name: '📋 Requirements',
                    value: '• Enough gold (🪙)\n• Required level\n• Correct class (if specified)',
                    inline: false
                },
                {
                    name: '🎒 After Purchase',
                    value: 'Use `/inventory` to view your purchased items',
                    inline: false
                }
            )
            .setFooter({ text: 'Need help? Contact server staff' });

        await interaction.reply({ 
            embeds: [embed], 
            ephemeral: true 
        });
    },
};