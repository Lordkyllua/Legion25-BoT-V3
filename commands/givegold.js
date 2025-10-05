const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givegold')
        .setDescription('Give gold to a user (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to give gold to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of gold to give')
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

        user.gold += amount;
        await user.save();

        const embed = new EmbedBuilder()
            .setTitle('💰 Gold Given')
            .setColor(0xF1C40F)
            .addFields(
                { name: '👤 User', value: `${targetUser.username}`, inline: true },
                { name: '💰 Amount', value: `${amount} Gold`, inline: true },
                { name: '🏦 New Balance', value: `${user.gold} Gold`, inline: true }
            )
            .setFooter({ text: 'Admin action' });

        await interaction.reply({ embeds: [embed] });
    }
};