const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    customId: 'inventory_equip',
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
        const equipped = user.rpg.equipped || {};
        
        // Filtrar items equipables (armas, armaduras, accesorios)
        const equippableItems = inventory.filter(item => 
            ['weapon', 'armor', 'accessory'].includes(item.type)
        );

        if (equippableItems.length === 0) {
            await interaction.reply({ 
                content: 'You have no equippable items in your inventory!', 
                ephemeral: true 
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('⚔️ Manage Equipment')
            .setColor(0x3498DB)
            .setDescription('Select an item to equip or unequip current items.')
            .setFooter({ text: 'Items will be automatically equipped to the correct slot' });

        // Mostrar items actualmente equipados
        if (equipped.weapon || equipped.armor || equipped.accessory) {
            let equippedText = '';
            if (equipped.weapon) equippedText += `⚔️ **Weapon**: ${equipped.weapon.name}\n`;
            if (equipped.armor) equippedText += `🛡️ **Armor**: ${equipped.armor.name}\n`;
            if (equipped.accessory) equippedText += `💎 **Accessory**: ${equipped.accessory.name}\n`;
            
            embed.addFields({
                name: '🎯 Currently Equipped',
                value: equippedText,
                inline: false
            });
        }

        // Crear menú de selección para equipar items
        const options = equippableItems.slice(0, 25).map(item => {
            const isEquipped = 
                (equipped.weapon?.id === item.id) ||
                (equipped.armor?.id === item.id) ||
                (equipped.accessory?.id === item.id);
            
            return {
                label: `${item.name} ${isEquipped ? '✅' : ''}`,
                value: `equip_${item.id}`,
                description: `${item.type} | Level ${item.level}`
            };
        });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('equip_item_select')
            .setPlaceholder('Select an item to equip...')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ 
            embeds: [embed], 
            components: [row],
            ephemeral: true 
        });
    },
};