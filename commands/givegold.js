const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { addGold, getGold } = require('../utils/gold');

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
                .setMinValue(1)
                .setMaxValue(1000000)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        try {
            const oldBalance = await getGold(targetUser.id);
            const newBalance = await addGold(targetUser.id, amount);

            const embed = new EmbedBuilder()
                .setTitle('💰 Gold Given')
                .setColor(0xFFD700)
                .addFields(
                    { name: '👤 Recipient', value: `${targetUser} (${targetUser.tag})`, inline: true },
                    { name: '🎁 Amount Given', value: `🪙 ${amount}`, inline: true },
                    { name: '📊 Old Balance', value: `🪙 ${oldBalance}`, inline: true },
                    { name: '💳 New Balance', value: `🪙 ${newBalance}`, inline: true },
                    { name: '👤 Given By', value: `${interaction.user}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Notificar al usuario
            try {
                await targetUser.send({
                    content: `🎉 You received 🪙 **${amount} gold** from an administrator!\nYour new balance: 🪙 **${newBalance} gold**`
                });
            } catch (error) {
                console.log('Could not send DM to user');
            }

        } catch (error) {
            console.error('Error giving gold:', error);
            await interaction.reply({ 
                content: 'There was an error giving gold to the user.', 
                ephemeral: true 
            });
        }
    },
};