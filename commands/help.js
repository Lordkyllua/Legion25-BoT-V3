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
                { name: 'evolution', description: 'Check available class evolutions' },
                { name: 'evolve', description: 'Evolve your class to more powerful forms' },
                { name: 'tinysurvivors', description: 'Learn about the Tiny Survivors inspiration' }
            ],
            '💰 Economy & Shop': [
                { name: 'shop', description: 'Browse items available for purchase' },
                { name: 'buy', description: 'Purchase items with your gold' },
                { name: 'inventory', description: 'View your purchased items' },
                { name: 'ranking', description: 'Check the points leaderboard' },
                { name: 'coinflip', description: 'Bet points on a coin flip game' }
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
            '🎉 Fun & Entertainment': [
                { name: 'meme', description: 'Get a random meme from Reddit' },
                { name: 'quote', description: 'Receive an inspirational quote' },
                { name: 'gif', description: 'Search for GIFs' },
                { name: 'fight', description: 'Challenge another player to a battle' }
            ]
        };

        const helpEmbed = new EmbedBuilder()
            .setColor(0x6a0dad)
            .setTitle('🌟 Survivor Bot - Command Center')
            .setDescription('Welcome to your survival adventure! Inspired by **Tiny Survivors** by **Micro Hunter**')
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
                    '1. **Start your journey**: Use `/class` to choose your class',
                    '2. **Build your character**: Use `/quest` to earn EXP and gold',
                    '3. **Gear up**: Visit `/shop` to buy powerful items',
                    '4. **Evolve**: Use `/evolution` at level 25, 50, and 75',
                    '5. **Learn more**: Use `/tinysurvivors` about the inspiration'
                ].join('\n')
            })
            .setFooter({
                text: 'Inspired by Tiny Survivors by Micro Hunter • Developed by LordK',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        const supportButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('🎮 Play Tiny Survivors')
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