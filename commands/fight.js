const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Challenge another player to a battle')
        .addUserOption(option =>
            option.setName('opponent')
                .setDescription('The user to challenge')
                .setRequired(true)),
    async execute(interaction) {
        const opponent = interaction.options.getUser('opponent');
        
        if (opponent.bot) {
            return await interaction.reply({ 
                content: 'You cannot challenge bots!', 
                ephemeral: true 
            });
        }

        if (opponent.id === interaction.user.id) {
            return await interaction.reply({ 
                content: 'You cannot challenge yourself!', 
                ephemeral: true 
            });
        }

        await interaction.reply({ 
            content: `⚔️ **Battle Challenge!**\n${interaction.user} has challenged ${opponent} to a battle!\n*Battle system under development...*` 
        });
    },
};