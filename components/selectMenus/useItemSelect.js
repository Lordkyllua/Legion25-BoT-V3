const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    customId: 'use_item_select',
    async execute(interaction) {
        const selectedValue = interaction.values[0];
        const itemId = parseInt(selectedValue.replace('use_', ''));
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
            const itemIndex = inventory.findIndex(i => i.id === itemId);
            
            if (itemIndex === -1) {
                await interaction.reply({ 
                    content: 'Item not found in your inventory!', 
                    ephemeral: true 
                });
                return;
            }

            const item = inventory[itemIndex];
            
            // Aplicar efectos del item
            let effectMessage = '';
            
            if (item.type === 'potion') {
                if (item.stats.hp) {
                    user.rpg.hp = Math.min(user.rpg.maxHp, user.rpg.hp + item.stats.hp);
                    effectMessage = `❤️ Restored ${item.stats.hp} HP!`;
                }
                if (item.stats.mp) {
                    user.rpg.mp = Math.min(user.rpg.maxMp, user.rpg.mp + item.stats.mp);
                    effectMessage += ` 💙 Restored ${item.stats.mp} MP!`;
                }
            }

            // Remover el item del inventario
            inventory.splice(itemIndex, 1);
            user.rpg.inventory = inventory;

            // Actualizar en la base de datos
            await User.updateRPG(userId, user.rpg);

            const embed = new EmbedBuilder()
                .setTitle('🧪 Item Used')
                .setColor(0x00FF00)
                .setDescription(`You used **${item.name}**`)
                .addFields(
                    { name: 'Effect', value: effectMessage || 'Item effect applied', inline: true },
                    { name: 'Remaining', value: `${inventory.length} items in inventory`, inline: true }
                )
                .setFooter({ text: 'Item consumed and removed from inventory' });

            await interaction.reply({ 
                embeds: [embed],
                ephemeral: true 
            });

        } catch (error) {
            console.error('Error using item:', error);
            await interaction.reply({ 
                content: 'There was an error using the item.', 
                ephemeral: true 
            });
        }
    },
};