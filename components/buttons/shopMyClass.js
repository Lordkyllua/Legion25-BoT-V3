const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const rpgUtil = require('../../utils/rpg');

module.exports = {
    name: 'shop_my_class',
    async execute(interaction, client) {
        try {
            await interaction.deferUpdate();
            
            const store = JSON.parse(fs.readFileSync('./store.json', 'utf8'));
            const userId = interaction.user.id;
            const profile = rpgUtil.getUserProfile(userId);
            
            if (!profile.class) {
                return await interaction.editReply({ 
                    content: '❌ You need to choose a class first with `/class` to see class-specific items!', 
                    components: [] 
                });
            }
            
            // Filtrar items que el usuario PUEDE COMPRAR (para su clase)
            const availableItems = store.items.filter(item => 
                (!item.class || item.class === 'all' || item.class === profile.class) &&
                (!item.requiredLevel || profile.level >= item.requiredLevel)
            );
            
            const unavailableItems = store.items.filter(item => 
                (item.class && item.class !== 'all' && item.class !== profile.class) ||
                (item.requiredLevel && profile.level < item.requiredLevel)
            );

            const embed = new EmbedBuilder()
                .setTitle(`🎯 Shop - Items for ${profile.className}`)
                .setColor(0x00ff00)
                .setDescription(`**Items available for your class**\nYou can purchase these items right now!`)
                .addFields(
                    {
                        name: `✅ Available to Buy (${availableItems.length} items)`,
                        value: availableItems.map(item => 
                            `• **${item.id}** - ${item.name} [${item.price}g] - ${item.category}`
                        ).join('\n') || 'No items available',
                        inline: false
                    },
                    {
                        name: `🔒 Currently Unavailable (${unavailableItems.length} items)`,
                        value: unavailableItems.slice(0, 10).map(item => {
                            const reasons = [];
                            if (item.class && item.class !== 'all' && item.class !== profile.class) {
                                reasons.push('wrong class');
                            }
                            if (item.requiredLevel && profile.level < item.requiredLevel) {
                                reasons.push(`need level ${item.requiredLevel}`);
                            }
                            return `• ${item.name} [${reasons.join(', ')}]`;
                        }).join('\n') + (unavailableItems.length > 10 ? `\n... and ${unavailableItems.length - 10} more` : ''),
                        inline: false
                    }
                )
                .setFooter({ 
                    text: `Your class: ${profile.className} • Level: ${profile.level} • Developed by LordK`, 
                    iconURL: client.user.displayAvatarURL() 
                });

            // Select menu para categorías
            const categories = [...new Set(store.items.map(item => item.category))];
            const categoryOptions = categories.map(category => ({
                label: category,
                value: category,
                description: `Browse ${category} items`
            }));
            
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('shopCategory')
                .setPlaceholder('Browse all categories...')
                .addOptions(categoryOptions);
            
            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.editReply({ 
                embeds: [embed],
                components: [row] 
            });
            
        } catch (error) {
            console.error('Error in shop my class:', error);
            await interaction.editReply({ 
                content: '❌ Error filtering items by class.', 
                components: [] 
            });
        }
    }
};