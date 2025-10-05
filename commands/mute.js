const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user (Mod only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(false)),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = await interaction.guild.members.fetch(targetUser.id);

        if (!member) {
            return await interaction.reply({ 
                content: '❌ User not found in this server.', 
                ephemeral: true 
            });
        }

        if (member.user.bot) {
            return await interaction.reply({ 
                content: '❌ Cannot mute bots.', 
                ephemeral: true 
            });
        }

        try {
            await member.timeout(duration * 60 * 1000, reason);

            const embed = new EmbedBuilder()
                .setTitle('🔇 User Muted')
                .setColor(0xE74C3C)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: '⏱️ Duration', value: `${duration} minutes`, inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setFooter({ text: 'Mute will expire automatically' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ 
                content: '❌ Failed to mute user. Check bot permissions and role hierarchy.', 
                ephemeral: true 
            });
        }
    }
};