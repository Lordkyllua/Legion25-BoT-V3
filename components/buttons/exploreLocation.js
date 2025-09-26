const rpgUtil = require('../../utils/rpg');
const pointsUtil = require('../../utils/points');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'explore_',
    async execute(interaction, client) {
        try {
            await interaction.deferUpdate();
            
            const locationName = interaction.customId.replace('explore_', '').replace(/_/g, ' ');
            const userId = interaction.user.id;
            const profile = rpgUtil.getUserProfile(userId);
            
            // Definir ubicaciones con sus recompensas
            const locations = {
                '🌲 Ancient Forest': { minGold: 10, maxGold: 30, minExp: 5, maxExp: 15, itemChance: 20 },
                '🏔️ Mountain Pass': { minGold: 20, maxGold: 50, minExp: 10, maxExp: 25, itemChance: 35 },
                '🏰 Abandoned Castle': { minGold: 30, maxGold: 70, minExp: 15, maxExp: 35, itemChance: 50 },
                '🌋 Dragon\'s Lair': { minGold: 50, maxGold: 100, minExp: 25, maxExp: 50, itemChance: 70 },
                '✨ Magic Academy': { minGold: 25, maxGold: 60, minExp: 20, maxExp: 40, itemChance: 60 },
                '⚔️ Warrior Camp': { minGold: 25, maxGold: 60, minExp: 20, maxExp: 40, itemChance: 60 },
                '🏹 Archer Range': { minGold: 25, maxGold: 60, minExp: 20, maxExp: 40, itemChance: 60 }
            };
            
            const location = locations[locationName];
            if (!location) {
                return await interaction.editReply({ 
                    content: '❌ Location not found.', 
                    components: [] 
                });
            }
            
            // Generar recompensas
            const goldGained = Math.floor(Math.random() * (location.maxGold - location.minGold + 1)) + location.minGold;
            const expGained = Math.floor(Math.random() * (location.maxExp - location.minExp + 1)) + location.minExp;
            const foundItem = Math.random() * 100 < location.itemChance;
            
            // Aplicar recompensas
            rpgUtil.addGold(userId, goldGained);
            rpgUtil.addExperience(userId, expGained);
            
            let itemMessage = '';
            if (foundItem) {
                const items = ['Health Potion', 'Mana Potion', 'Ancient Coin', 'Mysterious Herb', 'Magic Crystal'];
                const foundItemName = items[Math.floor(Math.random() * items.length)];
                itemMessage = `\n\n🎁 **You found a ${foundItemName}!**`;
                
                // Añadir item al inventario
                if (!profile.inventory) profile.inventory = [];
                profile.inventory.push({
                    name: foundItemName,
                    type: 'exploration',
                    foundAt: locationName
                });
            }
            
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('🗺️ Exploration Complete!')
                .setDescription(`You explored **${locationName}** and found treasures!${itemMessage}`)
                .addFields(
                    {
                        name: '💰 Gold Found',
                        value: `**+${goldGained}** 🥇`,
                        inline: true
                    },
                    {
                        name: '⭐ EXP Gained',
                        value: `**+${expGained}** ⭐`,
                        inline: true
                    },
                    {
                        name: '🎯 Discoveries',
                        value: foundItem ? '**Item Found!** 🎁' : 'No special items',
                        inline: true
                    }
                )
                .setFooter({ 
                    text: 'Explore different locations for unique rewards! • Developed by LordK',
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            await interaction.editReply({ 
                embeds: [embed], 
                components: [] 
            });
            
        } catch (error) {
            console.error('Error in explore location:', error);
            await interaction.editReply({ 
                content: '❌ Error during exploration.', 
                components: [] 
            });
        }
    }
};