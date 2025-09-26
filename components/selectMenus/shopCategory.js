const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const rpgUtil = require('../../utils/rpg');

module.exports = {
    name: 'shopCategory',
    async execute(interaction) {
        try {
            await interaction.deferUpdate();
            
            const category = interaction.values[0];
            const store = JSON.parse(fs.readFileSync('./store.json', 'utf8'));
            const userId = interaction.user.id;
            const profile = rpgUtil.getUserProfile(userId);
            
            // MOSTRAR TODOS LOS ITEMS DE LA CATEGORÍA, NO FILTRAR POR CLASE
            const categoryItems = store.items.filter(item => item.category === category);
            
            if (categoryItems.length === 0) {
                return await interaction.editReply({ 
                    content: `No items found in category: ${category}`, 
                    components: [] 
                });
            }
            
            const embed = new EmbedBuilder()
                .setTitle(`🛍️ ${category} - All Items`)
                .setColor(0x00FF00)
                .setDescription(`**All items in ${category} category**\nYou can see everything, but can only purchase items for your class.`)
                .setFooter({ 
                    text: `Showing ${categoryItems.length} items • Prices in gold • Developed by LordK`, 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
            
            // Agrupar items en campos (mostrar todos)
            categoryItems.forEach(item => {
                const requirements = [];
                if (item.requiredLevel) requirements.push(`Level ${item.requiredLevel}+`);
                if (item.class && item.class !== 'all') requirements.push(`${item.class} only`);
                
                // Indicador de si el usuario puede comprar el item
                let purchaseStatus = '🔒 Cannot buy';
                if (!item.class || item.class === 'all' || item.class === profile.class) {
                    if (!item.requiredLevel || profile.level >= item.requiredLevel) {
                        purchaseStatus = '✅ Can buy';
                    }
                }
                
                embed.addFields({
                    name: `🆔 ${item.id} - ${item.name} [${item.price} gold] ${purchaseStatus === '✅ Can buy' ? '✅' : '🔒'}`,
                    value: `${item.description}${requirements.length > 0 ? `\n**Requirements:** ${requirements.join(', ')}` : ''}\n**Status:** ${purchaseStatus}`,
                    inline: false
                });
            });

            // Botones de navegación
            const navigationRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_show_all')
                    .setLabel('📋 View All Categories')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('shop_my_class')
                    .setLabel('🎯 Filter by My Class')
                    .setStyle(ButtonStyle.Primary)
            );

            await interaction.editReply({ 
                embeds: [embed],
                components: [navigationRow] 
            });
            
        } catch (error) {
            console.error('Error in shop category:', error);
            await interaction.editReply({ 
                content: '❌ Error loading category items.', 
                components: [] 
            });
        }
    }
};