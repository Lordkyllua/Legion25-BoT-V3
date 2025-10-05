const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin and bet gold')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of gold to bet')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Choose heads or tails')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                )),
    
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const choice = interaction.options.getString('choice');

        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        
        if (!user) {
            return await interaction.reply({ 
                content: '❌ You need to start your RPG journey first! Use `/rpg start`', 
                ephemeral: true 
            });
        }

        if (user.gold < amount) {
            return await interaction.reply({ 
                content: `❌ You don't have enough gold! You need ${amount} but only have ${user.gold}.`, 
                ephemeral: true 
            });
        }

        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const won = choice === result;

        const embed = new EmbedBuilder()
            .setTitle('🪙 Coin Flip')
            .setColor(won ? 0x2ECC71 : 0xE74C3C)
            .addFields(
                { name: '🎯 Your Choice', value: choice.toUpperCase(), inline: true },
                { name: '🪙 Result', value: result.toUpperCase(), inline: true },
                { name: '💰 Bet Amount', value: `${amount} Gold`, inline: true },
                { name: '🏆 Result', value: won ? '**YOU WON!** 🎉' : '**You lost** 😢', inline: false }
            );

        if (won) {
            user.gold += amount;
            embed.addFields({ name: '💰 Winnings', value: `+${amount} Gold!`, inline: true });
        } else {
            user.gold -= amount;
            embed.addFields({ name: '💸 Loss', value: `-${amount} Gold`, inline: true });
        }

        embed.addFields({ name: '🏦 New Balance', value: `${user.gold} Gold`, inline: true });

        await user.save();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`coinflip_again_${amount}`)
                    .setLabel('Play Again')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('coinflip_double')
                    .setLabel('Double Bet')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};