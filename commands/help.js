const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Discover all the amazing features of Survivor Bot!'),
    
    async execute(interaction) {
        const commandCategories = {
            '🎮 RPG System': [
                { name: 'rpg', description: 'View your character profile and stats' },
                { name: 'class', description: 'Choose your RPG class (Warrior, Mage, Archer)' },
                { name: 'quest', description: 'Go on adventures to earn EXP, gold, and points' },
                { name: 'daily', description: 'Claim your daily reward' },
                { name: 'explore', description: 'Explore different locations for rewards' },
                { name: 'train', description: 'Train your skills to become stronger' },
                { name: 'evolution', description: 'Check available class evolutions' },
                { name: 'evolve', description: 'Evolve your class to more powerful forms' },
                { name: 'microhunter', description: 'Learn about the Micro Hunter game' }
            ],
            '💰 Economy & Shop': [
                { name: 'shop', description: 'Browse items available for purchase' },
                { name: 'buy', description: 'Purchase items with your gold' },
                { name: 'inventory', description: 'View your purchased items' },
                { name: 'ranking', description: 'Check the points leaderboard' },
                { name: 'coinflip', description: 'Bet points on a coin flip game' }
            ],
            '⚔️ Battle System': [
                { name: 'fight', description: 'Challenge another player to a battle' },
                { name: 'duel', description: 'Duel against AI opponents' },
                { name: 'boss', description: 'Fight against powerful bosses' }
            ],
            '👥 Social & Roles': [
                { name: 'roles', description: 'Self-assign roles from available options' }
            ],
            '🛡️ Moderation': [
                { name: 'roleadmin', description: 'Admin panel for managing assignable roles' },
                { name: 'warn', description: 'Issue warnings to users (Moderators only)' },
                { name: 'warnings', description: 'View user warning history' },
                { name: 'mute', description: 'Temporarily mute a user (Moderators only)' }
            ],
            '🎉 Fun': [
                { name: 'meme', description: 'Get a random meme' }
            ]
        };

        const helpEmbed = new EmbedBuilder()
            .setColor(0x6a0dad)
            .setTitle('🌟 Survivor Bot - Command Center')
            .setDescription('Welcome to your survival adventure! Inspired by **Micro Hunter**')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                Object.entries(commandCategories).map(([category, commands]) => ({
                    name: `${category}`,
                    value: commands.map(cmd => `**/${cmd.name}** - ${cmd.description}`).join('\n'),
                    inline: false
                }))
            )
            .addFields({
                name: '💫 Quick Start Guide',
                value: [
                    '1. **Start**: Use `/class` to choose your class',
                    '2. **Daily**: Use `/daily` for free rewards',
                    '3. **Progress**: Use `/quest` and `/explore` to earn EXP/gold',
                    '4. **Train**: Use `/train` to improve your skills',
                    '5. **Battle**: Use `/fight` or `/duel` for combat',
                    '6. **Evolve**: Use `/evolution` at level 25, 50, and 75'
                ].join('\n')
            })
            .setFooter({
                text: 'Micro Hunter game • Bot developed by LordK',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        const supportButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('🎮 Play Micro Hunter')
                .setStyle(ButtonStyle.Link)
                .setURL('https://www.micro-hunter.com/?lang=en'),
            new ButtonBuilder()
                .setLabel('🆘 Get Support')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('get_support')
                .setEmoji('🆘')
        );

        await interaction.reply({ 
            embeds: [helpEmbed], 
            components: [supportButton] 
        });
    }
};