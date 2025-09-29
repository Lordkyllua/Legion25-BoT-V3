const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Shop = require('../../models/Shop');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetshop')
        .setDescription('Reset shop items to default (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            
            const result = await Shop.resetShopItems();
            
            if (result) {
                const embed = new EmbedBuilder()
                    .setTitle('🔄 Shop Reset Successfully')
                    .setColor(0x00FF00)
                    .setDescription('All shop items have been reset to default!')
                    .addFields(
                        { name: '🆕 New Items', value: '31 items loaded', inline: true },
                        { name: '🔮 Mage Items', value: '7 items', inline: true },
                        { name: '⚔️ Warrior Items', value: '7 items', inline: true },
                        { name: '🏹 Archer Items', value: '7 items', inline: true },
                        { name: '🎯 All-class Items', value: '10 items', inline: true }
                    )
                    .setFooter({ text: 'Use /shop to see the new items!' });

                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply({ 
                    content: '❌ Failed to reset shop items. Check the console for errors.',
                    ephemeral: true 
                });
            }
        } catch (error) {
            console.error('Error resetting shop:', error);
            await interaction.editReply({ 
                content: '❌ An error occurred while resetting the shop.',
                ephemeral: true 
            });
        }
    },
};