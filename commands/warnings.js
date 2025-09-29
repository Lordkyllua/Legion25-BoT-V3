const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Warning = require('../models/Warning');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Check your warnings or another user\'s warnings')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check warnings for')
                .setRequired(false)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const guildId = interaction.guild.id;

        try {
            const warnings = await Warning.getUserWarnings(targetUser.id, guildId);
            const activeWarnings = await Warning.getActiveWarnings(targetUser.id, guildId);

            if (warnings.length === 0) {
                return await interaction.reply({ 
                    content: `${targetUser} has no warnings in this server.` 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`⚠️ Warnings for ${targetUser.username}`)
                .setColor(0xE74C3C)
                .setDescription(`**Total Warnings:** ${warnings.length}\n**Active Warnings:** ${activeWarnings.length}`)
                .setThumbnail(targetUser.displayAvatarURL());

            // Show only the last 5 warnings to avoid embed field limits
            const recentWarnings = warnings.slice(0, 5);
            
            recentWarnings.forEach((warning, index) => {
                const status = warning.active ? '🟢 Active' : '🔴 Inactive';
                const moderator = `<@${warning.moderatorId}>`;
                const date = new Date(warning.timestamp).toLocaleDateString();
                
                embed.addFields({
                    name: `Warning #${index + 1} • ${date} • ${status}`,
                    value: `**Reason:** ${warning.reason}\n**Moderator:** ${moderator}`,
                    inline: false
                });
            });

            if (warnings.length > 5) {
                embed.setFooter({ text: `Showing 5 of ${warnings.length} total warnings` });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in warnings command:', error);
            await interaction.reply({ 
                content: 'An error occurred while fetching warnings.', 
                ephemeral: true 
            });
        }
    },
};