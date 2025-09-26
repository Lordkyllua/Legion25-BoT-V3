const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tinysurvivors')
        .setDescription('Learn about the Tiny Survivors game by Micro Hunter that inspired this bot'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 Tiny Survivors - Micro Hunter')
            .setColor(0xFF6B00)
            .setDescription('This bot is inspired by the amazing incremental game **Tiny Survivors** developed by **Micro Hunter**!')
            .setThumbnail('https://www.micro-hunter.com/favicon.ico')
            .addFields(
                { 
                    name: '🏹 About the Game', 
                    value: 'Tiny Survivors is an incremental idle game where you survive waves of monsters, collect resources, upgrade your skills, and become the ultimate survivor in a minimalist pixel art world.' 
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
                    name: '🤖 Bot Features Inspired by Tiny Survivors', 
                    value: [
                        '• **Class System**: Warrior, Mage, Archer roles',
                        '• **Progression**: Level up to 100 with evolving classes',
                        '• **Survival Theme**: Quest-based wave survival mechanics',
                        '• **Resource Economy**: Gold and points system',
                        '• **Upgrade Paths**: Evolution system at levels 25, 50, 75'
                    ].join('\n') 
                },
                { 
                    name: '🎮 Play the Original Game', 
                    value: 'Experience the original incremental adventure that inspired this bot!'
                }
            )
            .setImage('https://kg-web-cdn.akamaized.net/master/official-website/l-official-frontend/public/images/logo-icon_m.jpg')
            .setFooter({ 
                text: 'Tiny Survivors by Micro Hunter • Bot developed by LordK', 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('🎮 Play Tiny Survivors')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.micro-hunter.com/?lang=en'),
                new ButtonBuilder()
                    .setLabel('👨‍💻 Micro Hunter Website')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.micro-hunter.com/'),
                new ButtonBuilder()
                    .setLabel('🌟 More Micro Hunter Games')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.micro-hunter.com/games.html')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [actionRow] 
        });
    }
};