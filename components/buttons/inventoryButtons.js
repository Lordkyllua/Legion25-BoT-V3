const { EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    name: 'inventory_',
    async execute(interaction, client) {
        try {
            await interaction.deferUpdate();
            const action = interaction.customId.replace('inventory_', '');
            const userId = interaction.user.id;
            
            if (action === 'equip') {
                const inventoryData = rpgUtil.getInventory(userId);
                const unequippedItems = inventoryData.inventory.filter(item => !item.equipped);
                
                if (unequippedItems.length === 0) {
                    return await interaction.editReply({
                        content: '❌ You have no items to equip.',
                        components: []
                    });
                }
                
                const embed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('⚔️ Equip Items')
                    .setDescription('Use `/equip <item_id>` to equip an item.')
                    .addFields(
                        unequippedItems.slice(0, 5).map(item => ({
                            name: `ID: ${item.id} - ${item.name}`,
                            value: `Type: ${item.type} | ${item.description || 'No description'}`,
                            inline: false
                        }))
                    );
                
                await interaction.editReply({ 
                    content: '**Example:** `/equip 5` to equip item with ID 5',
                    embeds: [embed],
                    components: [] 
                });
                
            } else if (action === 'unequip') {
                const profile = rpgUtil.getUserProfile(userId);
                const equippedItems = [];
                
                if (profile.equipment.weapon.id !== 0) equippedItems.push(profile.equipment.weapon);
                if (profile.equipment.armor.id !== 0) equippedItems.push(profile.equipment.armor);
                if (profile.equipment.accessory.id !== 0) equippedItems.push(profile.equipment.accessory);
                
                if (equippedItems.length === 0) {
                    return await interaction.editReply({
                        content: '❌ You have no items equipped.',
                        components: []
                    });
                }
                
                const embed = new EmbedBuilder()
                    .setColor(0xff9900)
                    .setTitle('📦 Unequip Items')
                    .setDescription('Use `/unequip <item_type>` to unequip an item.')
                    .addFields(
                        equippedItems.map(item => ({
                            name: `${item.name} (${item.type})`,
                            value: `Use \`/unequip ${item.type}\` to unequip this item`,
                            inline: false
                        }))
                    );
                
                await interaction.editReply({ 
                    content: '**Examples:** `/unequip weapon` or `/unequip armor`',
                    embeds: [embed],
                    components: [] 
                });
            }
            
        } catch (error) {
            console.error('Error in inventory buttons:', error);
            await interaction.editReply({
                content: '❌ Error processing inventory action.',
                components: []
            });
        }
    }
};