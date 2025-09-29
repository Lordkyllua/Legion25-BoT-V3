const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Warning = require('../models/Warning');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user (admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const guildId = interaction.guild.id;

        try {
            await Warning.addWarning(targetUser.id, guildId, interaction.user.id, reason);
            
            const warningCount = await Warning.getWarningCount(targetUser.id, guildId);

            const embed = new EmbedBuilder()
                .setTitle('⚠️ User Warned')
                .setColor(0xFFA500)
                .addFields(
                    { name: 'User', value: `${targetUser} (${targetUser.tag})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user}`, inline: true },
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Total Active Warnings', value: warningCount.toString(), inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            try {
                await targetUser.send(`You have been warned in **${interaction.guild.name}** for: ${reason}\n\nThis is warning #${warningCount}. Please follow the server rules.`);
            } catch (error) {
                console.log('Could not send DM to user');
            }

        } catch (error) {
            console.error('Error in warn command:', error);
            await interaction.reply({ 
                content: 'An error occurred while warning the user.', 
                ephemeral: true 
            });
        }
    },
};