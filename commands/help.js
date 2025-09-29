const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with all commands and features'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 Legion25 Bot - Command Center')
            .setDescription(`**Welcome to Legion25 RPG Bot!**\n\n*"Where every command begins a new adventure..."*\n\nBrowse through the categories below to learn about all available features.`)
            .setColor(0x00AE86)
            .setThumbnail('https://i.imgur.com/txB085t.jpeg')
            .addFields(
                { 
                    name: '🛠️ General Commands', 
                    value: '```/help - Show this help menu\n/ranking - View gold leaderboard\n/roles - Select server roles\n/shop - Browse magical items\n/buy - Purchase items with gold\n/inventory - Manage your items\n/coinflip - Bet gold on coin flip\n/gif - Get fun GIFs```' 
                },
                { 
                    name: '⚔️ RPG System', 
                    value: '```/rpg - Character management\n/microhunter - Game information\n/quest - Start adventures\n/fight - Battle monsters and bosses```' 
                },
                { 
                    name: '🛡️ Administration', 
                    value: '```/roleadmin - Manage roles\n/warn - Warn users\n/warnings - Check warnings\n/mute - Moderate users\n/givegold - Give gold to users\n/giveexp - Give experience to users\n/resetshop - Reset shop items```' 
                }
            )
            .setFooter({ 
                text: 'Developed with ❤️ by LordK • Inspired by Micro Hunter',
                iconURL: 'https://i.imgur.com/xaONJxl.jpeg'
            });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_rpg')
                    .setLabel('RPG Guide')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⚔️'),
                new ButtonBuilder()
                    .setCustomId('help_shop')
                    .setLabel('Shop Guide')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏪'),
                new ButtonBuilder()
                    .setCustomId('help_quests')
                    .setLabel('Quest Guide')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🏹'),
                new ButtonBuilder()
                    .setCustomId('help_combat')
                    .setLabel('Combat Guide')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⚔️')
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};