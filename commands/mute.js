const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user (admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(true)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason');

        const member = await interaction.guild.members.fetch(targetUser.id);
        
        try {
            await member.timeout(duration * 60 * 1000, reason);

            await interaction.reply({ 
                content: `🔇 **User Muted**\n${targetUser} has been muted for ${duration} minutes.\nReason: ${reason}` 
            });
        } catch (error) {
            await interaction.reply({ 
                content: 'Failed to mute user. Make sure I have the necessary permissions.', 
                ephemeral: true 
            });
        }
    },
};