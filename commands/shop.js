const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Item shop - Buy with gold earned in quests'),
    
    async execute(interaction) {
        try {
            const store = JSON.parse(fs.readFileSync('store.json', 'utf8'));
            
            const categories = [...new Set(store.items.map(item => item.category))];
            
            const categoryOptions = categories.map(category => ({
                label: category,
                value: category,
                description: `View ${category} items`
            }));
            
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('shopCategory')
                .setPlaceholder('Choose a category...')
                .addOptions(categoryOptions);
            
            const row = new ActionRowBuilder().addComponents(selectMenu);
            
            const embed = new EmbedBuilder()
                .setTitle('🛍️ Survivor Shop')
                .setDescription('Welcome to the shop! Here you can buy items with the **gold** you earn in quests.\n\n**💡 Tip:** Use `/quest` to earn gold and experience.')
                .setColor(0x00FF00)
                .addFields(
                    {
                        name: '📦 Available Categories',
                        value: categories.map(cat => `• ${cat}`).join('\n')
                    },
                    {
                        name: '💰 Your Gold',
                        value: `Check your current gold with \`/rpg\``,
                        inline: true
                    },
                    {
                        name: '🎯 Class Items',
                        value: 'Some items are exclusive to certain classes',
                        inline: true
                    }
                )
                .setFooter({ 
                    text: 'Developed by LordK • Use the dropdown to navigate', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });

            await interaction.reply({ 
                embeds: [embed], 
                components: [row] 
            });
            
        } catch (error) {
            console.error('Error in shop command:', error);
            await interaction.reply({
                content: '❌ Error loading the shop. Try again later.',
                ephemeral: true
            });
        }
    }
};