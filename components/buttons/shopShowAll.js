const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const rpgUtil = require('../../utils/rpg');

module.exports = {
    name: 'shop_show_all',
    async execute(interaction, client) {
        try {
            await interaction.deferUpdate();
            
            const store = JSON.parse(fs.readFileSync('./store.json', 'utf8'));
            const userId = interaction.user.id;
            const profile = rpgUtil.getUserProfile(userId);
            
            const embed = new EmbedBuilder()
                .setTitle('🛍️ All Shop Items')
                .setColor(0x0099ff)
                .setDescription('**Complete list of all available items**\nUse `/buy <item_id>` to purchase items for your class.')
                .setFooter({ 
                    text: `Total items: ${store.items.length} • Developed by LordK`, 
                    iconURL: client.user.displayAvatarURL() 
                });
            
            // Mostrar todos los items agrupados por categoría
            const categories = [...new Set(store.items.map(item => item.category))];
            
            categories.forEach(category => {
                const categoryItems = store.items.filter(item => item.category === category);
                const itemList = categoryItems.map(item => {
                    const requirements = [];
                    if (item.requiredLevel) requirements.push(`Lv.${item.requiredLevel}`);
                    if (item.class && item.class !== 'all') requirements.push(item.class);
                    
                    const canBuy = (!item.class || item.class === 'all' || item.class === profile.class) &&
                                 (!item.requiredLevel || profile.level >= item.requiredLevel);
                    
                    return `• **${item.id}** - ${item.name} [${item.price}g] ${canBuy ? '✅' : '🔒'}`;
                }).join('\n');
                
                embed.addFields({
                    name: `${category} (${categoryItems.length} items)`,
                    value: itemList || 'No items',
                    inline: false
                });
            });

            // Select menu para categorías
            const categoryOptions = categories.map(category => ({
                label: category,
                value: category,
                description: `Browse ${category} items`
            }));
            
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('shopCategory')
                .setPlaceholder('Browse by category...')
                .addOptions(categoryOptions);
            
            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.editReply({ 
                embeds: [embed],
                components: [row] 
            });
            
        } catch (error) {
            console.error('Error in shop show all:', error);
            await interaction.editReply({ 
                content: '❌ Error loading all items.', 
                components: [] 
            });
        }
    }
};