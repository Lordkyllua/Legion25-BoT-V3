const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGold, addGold, removeGold } = require('../utils/gold');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin and bet gold')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('Amount of gold to bet')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Heads or tails')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                )),
    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');
        const choice = interaction.options.getString('choice');
        const userId = interaction.user.id;

        try {
            const userGold = await getGold(userId);

            if (userGold < bet) {
                return await interaction.reply({ 
                    content: `You don't have enough gold! You have 🪙 ${userGold} but need 🪙 ${bet}.`, 
                    ephemeral: true 
                });
            }

            const result = Math.random() < 0.5 ? 'heads' : 'tails';
            const win = result === choice;

            if (win) {
                const winnings = bet * 2;
                await addGold(userId, bet); // They get their bet back + winnings
                const embed = new EmbedBuilder()
                    .setTitle('🎉 You Won!')
                    .setDescription(`The coin landed on **${result}**!`)
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '💰 Winnings', value: `🪙 +${winnings}`, inline: true },
                        { name: '💰 New Balance', value: `🪙 ${userGold + winnings}`, inline: true }
                    );
                await interaction.reply({ embeds: [embed] });
            } else {
                await removeGold(userId, bet);
                const embed = new EmbedBuilder()
                    .setTitle('💸 You Lost!')
                    .setDescription(`The coin landed on **${result}**!`)
                    .setColor(0xFF0000)
                    .addFields(
                        { name: '💰 Loss', value: `🪙 -${bet}`, inline: true },
                        { name: '💰 New Balance', value: `🪙 ${userGold - bet}`, inline: true }
                    );
                await interaction.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Error in coinflip command:', error);
            await interaction.reply({ 
                content: 'An error occurred while processing your bet.', 
                ephemeral: true 
            });
        }
    },
};