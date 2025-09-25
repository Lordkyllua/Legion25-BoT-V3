const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tinysurvivors')
        .setDescription('Learn about the Tiny Survivors inspiration behind this bot'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 Tiny Survivors Inspiration')
            .setColor(0xFF6B00)
            .setDescription('This bot is inspired by the amazing game **Tiny Survivors**! Experience the survival adventure in Discord.')
            .addFields(
                { 
                    name: '🏹 Game Concept', 
                    value: 'Survive waves of enemies, upgrade your skills, collect powerful items, and become the ultimate survivor in this auto-battler RPG experience!' 
                },
                { 
                    name: '🤖 Bot Features Inspired by Tiny Survivors', 
                    value: [
                        '• **Class System**: Warrior, Mage, Archer with unique abilities',
                        '• **Evolution Paths**: Transform your class at levels 25, 50, and 75',
                        '• **Survival Progression**: Level up to 100 with increasing challenges',
                        '• **Item Collection**: Shop system with class-specific equipment',
                        '• **Wave-based Gameplay**: Quest system simulating survival waves'
                    ].join('\n') 
                },
                { 
                    name: '🎯 Similar Mechanics', 
                    value: [
                        '• Progressive difficulty scaling',
                        '• Strategic class choices matter',
                        '• Permanent evolution decisions',
                        '• Resource management (gold/points)',
                        '• Achievement and progression tracking'
                    ].join('\n') 
                },
                { 
                    name: '🌟 Unique Bot Additions', 
                    value: [
                        '• Discord integration with roles and communities',
                        '• Social features like clans and leaderboards',
                        '• Interactive menus and visual progression',
                        '• Moderation tools for server management',
                        '• Fun commands for community engagement'
                    ].join('\n') 
                }
            )
            .setImage('https://i.imgur.com/r8Q7W4k.png')
            .setFooter({ 
                text: 'Bot developed by LordK • Try the actual Tiny Survivors game on Steam!', 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};