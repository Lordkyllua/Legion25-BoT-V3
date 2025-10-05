const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('View the server leaderboards')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Ranking category')
                .addChoices(
                    { name: 'Level', value: 'level' },
                    { name: 'Gold', value: 'gold' },
                    { name: 'Monsters Defeated', value: 'monsters' },
                    { name: 'Bosses Defeated', value: 'bosses' }
                )),
    
    async execute(interaction) {
        const category = interaction.options.getString('category') || 'level';
        
        let sortCriteria = {};
        let title = '';
        let emoji = '';

        switch (category) {
            case 'level':
                sortCriteria = { level: -1, exp: -1 };
                title = 'Level Ranking';
                emoji = '📊';
                break;
            case 'gold':
                sortCriteria = { gold: -1 };
                title = 'Wealth Ranking';
                emoji = '💰';
                break;
            case 'monsters':
                sortCriteria = { monstersDefeated: -1 };
                title = 'Monster Slayer Ranking';
                emoji = '⚔️';
                break;
            case 'bosses':
                sortCriteria = { bossesDefeated: -1 };
                title = 'Boss Slayer Ranking';
                emoji = '👑';
                break;
        }

        const users = await User.find({ guildId: interaction.guild.id })
            .sort(sortCriteria)
            .limit(10);

        if (users.length === 0) {
            return await interaction.reply({ 
                content: '❌ No players found on this server! Use `/rpg start` to begin your journey.', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${emoji} ${title}`)
            .setColor(0xE91E63)
            .setDescription(`Top 10 players in ${interaction.guild.name}`)
            .setFooter({ text: 'Micro Hunter RPG - Developed by LordK' });

        users.forEach((user, index) => {
            let value = '';
            let rankEmoji = getRankEmoji(index + 1);

            switch (category) {
                case 'level':
                    value = `Level ${user.level} • ${user.exp} XP • ${user.class}`;
                    break;
                case 'gold':
                    value = `${user.gold} Gold • Level ${user.level} • ${user.class}`;
                    break;
                case 'monsters':
                    value = `${user.monstersDefeated} Monsters • Level ${user.level} • ${user.class}`;
                    break;
                case 'bosses':
                    value = `${user.bossesDefeated} Bosses • Level ${user.level} • ${user.class}`;
                    break;
            }

            embed.addFields({
                name: `${rankEmoji} ${user.username}`,
                value: value,
                inline: false
            });
        });

        // Add current user's position if not in top 10
        const allUsers = await User.find({ guildId: interaction.guild.id }).sort(sortCriteria);
        const userIndex = allUsers.findIndex(u => u.userId === interaction.user.id);
        
        if (userIndex >= 10) {
            const user = allUsers[userIndex];
            let userValue = '';
            
            switch (category) {
                case 'level':
                    userValue = `Level ${user.level} • ${user.exp} XP`;
                    break;
                case 'gold':
                    userValue = `${user.gold} Gold`;
                    break;
                case 'monsters':
                    userValue = `${user.monstersDefeated} Monsters`;
                    break;
                case 'bosses':
                    userValue = `${user.bossesDefeated} Bosses`;
                    break;
            }

            embed.addFields({
                name: `📌 Your Position (#${userIndex + 1})`,
                value: userValue,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};

function getRankEmoji(rank) {
    switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return `**${rank}.**`;
    }
}