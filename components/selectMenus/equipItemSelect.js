const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    customId: 'equip_item_select',
    async execute(interaction) {
        const selectedValue = interaction.values[0];
        const itemId = parseInt(selectedValue.replace('equip_', ''));
        const userId = interaction.user.id;

        try {
            const user = await User.findById(userId);
            if (!user || !user.rpg) {
                await interaction.reply({ 
                    content: 'Character not found!', 
                    ephemeral: true 
                });
                return;
            }

            const inventory = user.rpg.inventory;
            const item = inventory.find(i => i.id === itemId);
            
            if (!item) {
                await interaction.reply({ 
                    content: 'Item not found in your inventory!', 
                    ephemeral: true 
                });
                return;
            }

            // Equipar el item en el slot correcto
            const equipped = user.rpg.equipped || {};
            const slot = item.type; // weapon, armor, accessory

            // Verificar si ya está equipado
            const isEquipped = equipped[slot]?.id === itemId;
            
            if (isEquipped) {
                // Desequipar
                equipped[slot] = null;
                await interaction.reply({ 
                    content: `✅ **${item.name}** has been unequipped.`,
                    ephemeral: true 
                });
            } else {
                // Equipar
                equipped[slot] = item;
                await interaction.reply({ 
                    content: `✅ **${item.name}** has been equipped!`,
                    ephemeral: true 
                });
            }

            // Actualizar en la base de datos
            user.rpg.equipped = equipped;
            await User.updateRPG(userId, user.rpg);

        } catch (error) {
            console.error('Error equipping item:', error);
            await interaction.reply({ 
                content: 'There was an error equipping the item.', 
                ephemeral: true 
            });
        }
    },
};