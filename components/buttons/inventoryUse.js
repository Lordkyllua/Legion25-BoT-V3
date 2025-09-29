const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    customId: 'inventory_use',
    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findById(userId);

        if (!user || !user.rpg || !user.rpg.inventory || user.rpg.inventory.length === 0) {
            await interaction.reply({ 
                content: 'Your inventory is empty!', 
                ephemeral: true 
            });
            return;
        }

        const inventory = user.rpg.inventory;
        
        // Filtrar items usables (pociones, consumibles)
        const usableItems = inventory.filter(item => 
            ['potion', 'consumable'].includes(item.type)
        );

        if (usableItems.length === 0) {
            await interaction.reply({ 
                content: 'You have no usable items in your inventory!', 
                ephemeral: true 
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('🧪 Use Items')
            .setColor(0x9B59B6)
            .setDescription('Select a consumable item to use.')
            .setFooter({ text: 'Consumables will be removed after use' });

        // Crear menú de selección para usar items
        const options = usableItems.slice(0, 25).map(item => ({
            label: item.name,
            value: `use_${item.id}`,
            description: item.description.substring(0, 50) + '...'
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('use_item_select')
            .setPlaceholder('Select an item to use...')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ 
            embeds: [embed], 
            components: [row],
            ephemeral: true 
        });
    },
};