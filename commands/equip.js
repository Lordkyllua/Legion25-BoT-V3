const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip')
        .setDescription('Equip an item from your inventory')
        .addIntegerOption(option =>
            option.setName('item_id')
                .setDescription('ID of the item to equip')
                .setRequired(true)),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const itemId = interaction.options.getInteger('item_id');
            
            const result = rpgUtil.equipItem(userId, itemId);
            
            if (result.success) {
                const profile = rpgUtil.getUserProfile(userId);
                
                const embed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('✅ Item Equipped!')
                    .setDescription(result.message)
                    .addFields(
                        {
                            name: '🎯 Updated Stats',
                            value: `⚔️ Attack: ${profile.stats.attack}\n🛡️ Defense: ${profile.stats.defense}\n🔮 Magic: ${profile.stats.magic}\n🎯 Agility: ${profile.stats.agility}`,
                            inline: true
                        },
                        {
                            name: '❤️ Health',
                            value: `${profile.health}/${profile.maxHealth} HP`,
                            inline: true
                        }
                    )
                    .setFooter({ 
                        text: 'Use /inventory to manage your items • Developed by LordK',
                        iconURL: interaction.user.displayAvatarURL()
                    });
                
                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({
                    content: result.message,
                    ephemeral: true
                });
            }
            
        } catch (error) {
            console.error('Error in equip command:', error);
            await interaction.reply({
                content: '❌ Error equipping item. Please try again.',
                ephemeral: true
            });
        }
    }
};