const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user (Mod only)')
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

        let user = await User.findOne({ userId: targetUser.id, guildId: interaction.guild.id });
        
        if (!user) {
            user = new User({
                userId: targetUser.id,
                guildId: interaction.guild.id,
                username: targetUser.username
            });
        }

        if (!user.warnings) user.warnings = [];
        user.warnings.push({
            reason: reason,
            moderator: interaction.user.id,
            date: new Date()
        });

        await user.save();

        const embed = new EmbedBuilder()
            .setTitle('⚠️ User Warned')
            .setColor(0xF39C12)
            .addFields(
                { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: '📝 Reason', value: reason, inline: false },
                { name: '📊 Total Warnings', value: `${user.warnings.length}`, inline: true }
            )
            .setFooter({ text: 'Use /warnings to view all warnings' });

        try {
            await targetUser.send({
                content: `⚠️ You have been warned in **${interaction.guild.name}**\n**Reason:** ${reason}`
            });
        } catch (error) {
            embed.addFields({ name: '📨 DM Status', value: 'Could not send DM to user', inline: true });
        }

        await interaction.reply({ embeds: [embed] });
    }
};