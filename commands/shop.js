const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Browse all available items in the shop'),
    
    async execute(interaction) {
        try {
            const storePath = './store.json';
            if (!fs.existsSync(storePath)) {
                return await interaction.reply({
                    content: '❌ The shop is currently unavailable.',
                    flags: 64
                });
            }
            
            const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
            const userId = interaction.user.id;
            const profile = rpgUtil.getUserProfile(userId);
            
            // Agrupar por categoría - MOSTRAR TODOS LOS ITEMS
            const categories = [...new Set(store.items.map(item => item.category))];
            
            const categoryOptions = categories.map(category => ({
                label: category,
                value: category,
                description: `Browse ${category} items`
            }));
            
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('shopCategory')
                .setPlaceholder('Select a category to browse...')
                .addOptions(categoryOptions);
            
            const row = new ActionRowBuilder().addComponents(selectMenu);
            
            // Botón para ver todos los items sin filtrar
            const buttonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_show_all')
                    .setLabel('📋 View All Items')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('shop_my_class')
                    .setLabel('🎯 Items for My Class')
                    .setStyle(ButtonStyle.Primary)
            );
            
            const embed = new EmbedBuilder()
                .setTitle('🛍️ Survivor Shop - All Items')
                .setDescription('**Browse all available items!**\nYou can see everything, but can only purchase items for your class.')
                .setColor(0x00FF00)
                .addFields(
                    {
                        name: '💰 Your Gold',
                        value: `**${profile.gold}** 🥇 available`,
                        inline: true
                    },
                    {
                        name: '🎯 Your Class',
                        value: profile.class ? `**${profile.className}**` : '**No class chosen**',
                        inline: true
                    },
                    {
                        name: '📦 Available Categories',
                        value: categories.map(cat => `• ${cat}`).join('\n') || 'No categories',
                        inline: false
                    },
                    {
                        name: 'ℹ️ Purchase Rules',
                        value: '• You can **view all items**\n• You can only **buy items for your class**\n• Some items require **specific levels**\n• Use `/buy <item_id>` to purchase',
                        inline: false
                    }
                )
                .setFooter({ 
                    text: `Total items: ${store.items.length} • Use the dropdown to browse • Developed by LordK`, 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });

            await interaction.reply({ 
                embeds: [embed], 
                components: [row, buttonRow] 
            });
            
        } catch (error) {
            console.error('Error in shop command:', error);
            await interaction.reply({
                content: '❌ Error loading the shop. Please try again later.',
                flags: 64
            });
        }
    }
};