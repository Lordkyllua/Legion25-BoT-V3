const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Purchase an item from the shop')
        .addIntegerOption(option =>
            option.setName('item_id')
                .setDescription('The ID of the item to buy')
                .setRequired(true)
                .setMinValue(1)),
    async execute(interaction) {
        const itemId = interaction.options.getInteger('item_id');
        const store = JSON.parse(fs.readFileSync('./store.json', 'utf8'));
        const gold = JSON.parse(fs.readFileSync('./gold.json', 'utf8'));
        const database = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
        
        const item = store.items.find(i => i.id === itemId);
        const userGold = gold[interaction.user.id] || 0;
        const userData = database.users[interaction.user.id];

        if (!item) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Item Not Found')
                .setDescription(`No item found with ID: ${itemId}`)
                .setColor(0xFF0000)
                .setFooter({ text: 'Use /shop to browse available items' });
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Check if user has enough gold
        if (userGold < item.price) {
            const embed = new EmbedBuilder()
                .setTitle('💰 Insufficient Gold')
                .setDescription(`You need 🪙 **${item.price}** but only have 🪙 **${userGold}**`)
                .setColor(0xFFA500)
                .addFields(
                    { name: 'Item', value: item.name, inline: true },
                    { name: 'Price', value: `🪙 ${item.price}`, inline: true }
                );
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Check level requirement
        if (userData && item.level > userData.level) {
            const embed = new EmbedBuilder()
                .setTitle('📈 Level Requirement')
                .setDescription(`You need to be level **${item.level}** to purchase this item`)
                .setColor(0xFFA500)
                .addFields(
                    { name: 'Your Level', value: `Level ${userData.level}`, inline: true },
                    { name: 'Required', value: `Level ${item.level}`, inline: true }
                );
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Check class requirement
        if (item.class !== 'all' && userData && item.class !== userData.class) {
            const embed = new EmbedBuilder()
                .setTitle('🎭 Class Restriction')
                .setDescription(`This item is for **${item.class}** class only`)
                .setColor(0xFFA500)
                .addFields(
                    { name: 'Your Class', value: userData.class, inline: true },
                    { name: 'Required', value: item.class, inline: true }
                );
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Purchase item
        gold[interaction.user.id] = userGold - item.price;
        fs.writeFileSync('./gold.json', JSON.stringify(gold, null, 2));

        if (!database.users[interaction.user.id]) {
            database.users[interaction.user.id] = { inventory: [] };
        }
        if (!database.users[interaction.user.id].inventory) {
            database.users[interaction.user.id].inventory = [];
        }
        database.users[interaction.user.id].inventory.push(item);
        fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('🎉 Purchase Successful!')
            .setDescription(`You bought **${item.name}**`)
            .setColor(0x00FF00)
            .addFields(
                { name: '💰 Price Paid', value: `🪙 ${item.price}`, inline: true },
                { name: '💰 Remaining Gold', value: `🪙 ${gold[interaction.user.id]}`, inline: true },
                { name: '📦 Item Added', value: 'Check your `/inventory`', inline: true }
            )
            .setThumbnail('https://i.imgur.com/5R5z8Q2.png')
            .setFooter({ text: 'Use /inventory to view your new item!' });

        await interaction.reply({ embeds: [embed] });
    },
};