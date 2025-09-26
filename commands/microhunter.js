const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('microhunter')
        .setDescription('Learn about the Micro Hunter game that inspired this bot'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 Micro Hunter')
            .setColor(0xFF6B00)
            .setDescription('This bot is inspired by the amazing incremental game **Micro Hunter**!')
            .setThumbnail('https://www.micro-hunter.com/favicon.ico')
            .addFields(
                { 
                    name: '🏹 About the Game', 
                    value: 'Micro Hunter is an incremental idle game where you survive waves of monsters, collect resources, upgrade your skills, and become the ultimate survivor in a minimalist pixel art world.' 
                },
                { 
                    name: '🎯 Game Features', 
                    value: [
                        '• **Incremental Progression**: Constant growth and upgrades',
                        '• **Wave Survival**: Defend against endless monster waves',
                        '• **Skill Trees**: Unlock and upgrade unique abilities',
                        '• **Resource Management**: Collect and manage various resources',
                        '• **Prestige System**: Reset for permanent bonuses',
                        '• **Minimalist Design**: Clean, pixel-art aesthetics'
                    ].join('\n') 
                },
                { 
                    name: '🤖 Bot Features Inspired by Micro Hunter', 
                    value: [
                        '• **Class System**: Warrior, Mage, Archer roles inspired by the game',
                        '• **Progression**: Level up system based on game mechanics',
                        '• **Survival Theme**: Quest-based wave survival from Micro Hunter',
                        '• **Resource Economy**: Gold system similar to game resources',
                        '• **Evolution Paths**: Based on game progression systems'
                    ].join('\n') 
                }
            )
            .setImage('https://i.imgur.com/r8Q7W4k.png')
            .setFooter({ 
                text: 'Micro Hunter game • Bot developed by LordK', 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('🎮 Play Micro Hunter')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.micro-hunter.com/?lang=en'),
                new ButtonBuilder()
                    .setLabel('🌐 Visit Website')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.micro-hunter.com/'),
                new ButtonBuilder()
                    .setLabel('⭐ Rate the Game')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.micro-hunter.com/?lang=en')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [actionRow] 
        });
    }
};