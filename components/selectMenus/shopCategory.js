const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const rpgUtil = require('../../utils/rpg');

module.exports = {
    name: 'shopCategory',
    async execute(interaction) {
        try {
            await interaction.deferUpdate();
            
            const category = interaction.values[0];
            const userId = interaction.user.id;
            const profile = rpgUtil.getUserProfile(userId);
            const store = JSON.parse(fs.readFileSync('./store.json', 'utf8'));
            
            // Filtrar items por categoría y requisitos del jugador
            const categoryItems = store.items.filter(item => 
                item.category === category && 
                (!item.requiredLevel || profile.level >= item.requiredLevel) &&
                (!item.class || item.class === 'all' || item.class === profile.class)
            );
            
            if (categoryItems.length === 0) {
                const noItemsEmbed = new EmbedBuilder()
                    .setColor(0xffa500)
                    .setTitle(`📦 ${category}`)
                    .setDescription('No items available in this category that meet your requirements.')
                    .addFields(
                        {
                            name: '💡 Requirements Not Met',
                            value: 'You may need to:\n• Reach a higher level\n• Choose a specific class\n• Wait for new items to be added'
                        }
                    )
                    .setFooter({ 
                        text: 'Check other categories or improve your character • Developed by LordK',
                        iconURL: interaction.client.user.displayAvatarURL()
                    });

                return await interaction.editReply({ 
                    embeds: [noItemsEmbed], 
                    components: [] 
                });
            }
            
            // Agrupar items en páginas (máximo 6 por página)
            const itemsPerPage = 6;
            const totalPages = Math.ceil(categoryItems.length / itemsPerPage);
            let currentPage = 0;
            
            function createPageEmbed(page) {
                const startIdx = page * itemsPerPage;
                const endIdx = startIdx + itemsPerPage;
                const pageItems = categoryItems.slice(startIdx, endIdx);
                
                const embed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`🛍️ ${category} - Page ${page + 1}/${totalPages}`)
                    .setDescription(`Items available in **${category}**\nUse \`/buy <item_id>\` to purchase`)
                    .setFooter({ 
                        text: `Your gold: ${profile.gold} • Page ${page + 1}/${totalPages} • Developed by LordK`, 
                        iconURL: interaction.client.user.displayAvatarURL() 
                    });
                
                pageItems.forEach(item => {
                    const requirements = [];
                    if (item.requiredLevel) requirements.push(`Level ${item.requiredLevel}+`);
                    if (item.class && item.class !== 'all') requirements.push(`${item.class} only`);
                    
                    embed.addFields({
                        name: `🆔 ${item.id} - ${item.name} [${item.price} gold]`,
                        value: `${item.description}${requirements.length > 0 ? `\n**Requirements:** ${requirements.join(', ')}` : ''}`,
                        inline: false
                    });
                });
                
                return embed;
            }
            
            // Crear botones de navegación
            function createNavigationButtons(page, totalPages) {
                const row = new ActionRowBuilder();
                
                if (page > 0) {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`shop_prev_${category}_${page}`)
                            .setLabel('⬅️ Previous')
                            .setStyle(ButtonStyle.Secondary)
                    );
                }
                
                if (page < totalPages - 1) {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`shop_next_${category}_${page}`)
                            .setLabel('Next ➡️')
                            .setStyle(ButtonStyle.Secondary)
                    );
                }
                
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('shop_back')
                        .setLabel('🏠 Back to Categories')
                        .setStyle(ButtonStyle.Primary)
                );
                
                return row;
            }
            
            const embed = createPageEmbed(currentPage);
            const components = totalPages > 1 ? [createNavigationButtons(currentPage, totalPages)] : [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('shop_back')
                        .setLabel('🏠 Back to Categories')
                        .setStyle(ButtonStyle.Primary)
                )
            ];

            await interaction.editReply({ 
                embeds: [embed], 
                components: components 
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