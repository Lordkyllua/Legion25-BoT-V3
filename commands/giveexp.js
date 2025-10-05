const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveexp')
        .setDescription('Give experience to a user (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to give experience to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of experience to give')
                .setRequired(true)
                .setMinValue(1)),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        const user = await User.findOne({ userId: targetUser.id, guildId: interaction.guild.id });
        
        if (!user) {
            return await interaction.reply({ 
                content: '❌ That user has not started their RPG journey!', 
                ephemeral: true 
            });
        }

        const leveledUp = user.addExp(amount);
        await user.save();

        const embed = new EmbedBuilder()
            .setTitle('⭐ Experience Given')
            .setColor(0x9B59B6)
            .addFields(
                { name: '👤 User', value: `${targetUser.username}`, inline: true },
                { name: '⭐ Amount', value: `${amount} EXP`, inline: true },
                { name: '📊 Level', value: `Level ${user.level}`, inline: true },
                { name: '💫 Experience', value: `${user.exp}/${user.level * 100} XP`, inline: true }
            )
            .setFooter({ text: 'Admin action' });

        if (leveledUp) {
            embed.setDescription(`🎉 **Level Up!** ${targetUser.username} reached level ${user.level}!`);
        }

        await interaction.reply({ embeds: [embed] });
    }
};