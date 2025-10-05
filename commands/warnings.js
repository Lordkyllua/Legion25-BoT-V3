const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check warnings for')
                .setRequired(false)),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;

        const user = await User.findOne({ userId: targetUser.id, guildId: interaction.guild.id });
        
        if (!user || !user.warnings || user.warnings.length === 0) {
            return await interaction.reply({ 
                content: `✅ ${targetUser.username} has no warnings.`, 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`⚠️ Warnings for ${targetUser.username}`)
            .setColor(0xF39C12)
            .setDescription(`Total Warnings: **${user.warnings.length}**`);

        user.warnings.slice(0, 10).forEach((warning, index) => {
            const date = warning.date.toLocaleDateString();
            embed.addFields({
                name: `Warning #${index + 1}`,
                value: `**Reason:** ${warning.reason}\n**Date:** ${date}\n**Moderator:** <@${warning.moderator}>`,
                inline: false
            });
        });

        if (user.warnings.length > 10) {
            embed.setFooter({ text: `Showing 10 of ${user.warnings.length} warnings` });
        }

        await interaction.reply({ embeds: [embed] });
    }
};