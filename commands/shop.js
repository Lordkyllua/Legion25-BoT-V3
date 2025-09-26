const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Browse and buy items with your gold'),
    
    async execute(interaction) {
        try {
            const storePath = './store.json';
            if (!fs.existsSync(storePath)) {
                return await interaction.reply({
                    content: '❌ The shop is currently unavailable.',
                    ephemeral: true
                });
            }
            
            const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
            const userId = interaction.user.id;
            const profile = rpgUtil.getUserProfile(userId);
            
            // Categorías organizadas
            const categories = [
                { name: 'Consumables', emoji: '🧪', description: 'Potions and temporary boosts' },
                { name: 'Warrior Weapons', emoji: '⚔️', description: 'Weapons for warriors' },
                { name: 'Mage Weapons', emoji: '🔮', description: 'Weapons for mages' },
                { name: 'Archer Weapons', emoji: '🏹', description: 'Weapons for archers' },
                { name: 'Armor', emoji: '🛡️', description: 'Protective gear for all classes' },
                { name: 'Accessories', emoji: '💍', description: 'Rings, amulets, and other items' },
                { name: 'Bundles', emoji: '📦', description: 'Special item bundles' }
            ];
            
            const categoryOptions = categories.map(cat => ({
                label: cat.name,
                value: cat.name,
                description: cat.description,
                emoji: cat.emoji
            }));
            
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('shopCategory')
                .setPlaceholder('Select a category to browse...')
                .addOptions(categoryOptions);
            
            const row = new ActionRowBuilder().addComponents(selectMenu);
            
            const embed = new EmbedBuilder()
                .setTitle('🛍️ Survivor Shop')
                .setDescription('Buy items with the **gold** you earn from quests and exploration!\n\n**💡 Tip:** Some items are class-specific and have level requirements.')
                .setColor(0x00FF00)
                .addFields(
                    {
                        name: '💰 Your Balance',
                        value: `**${profile.gold} gold** 🥇 available`,
                        inline: true
                    },
                    {
                        name: '🎯 Your Class',
                        value: profile.className || 'Not chosen yet',
                        inline: true
                    },
                    {
                        name: '📊 Your Level',
                        value: `Level ${profile.level}`,
                        inline: true
                    },
                    {
                        name: '🛒 How to Buy',
                        value: '1. Select a category below\n2. Note the item ID\n3. Use `/buy <item_id>` to purchase\n4. Check requirements before buying!',
                        inline: false
                    }
                )
                .setFooter({ 
                    text: `Use /quest and /explore to earn more gold! • Developed by LordK`, 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });

            await interaction.reply({ 
                embeds: [embed], 
                components: [row] 
            });
            
        } catch (error) {
            console.error('Error in shop command:', error);
            await interaction.reply({
                content: '❌ Error loading the shop. Please try again later.',
                ephemeral: true
            });
        }
    }
};