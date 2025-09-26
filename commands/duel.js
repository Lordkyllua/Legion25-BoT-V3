const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duel')
        .setDescription('Duel against AI opponents for rewards'),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const profile = rpgUtil.getUserProfile(userId);
            
            // Oponentes AI basados en nivel del jugador
            const aiOpponents = [
                {
                    name: 'Goblin Scout',
                    level: Math.max(1, profile.level - 2),
                    stats: { attack: 8, defense: 5, magic: 3, agility: 7 }
                },
                {
                    name: 'Orc Warrior', 
                    level: profile.level,
                    stats: { attack: 12, defense: 8, magic: 2, agility: 5 }
                },
                {
                    name: 'Dark Mage',
                    level: profile.level + 1,
                    stats: { attack: 6, defense: 4, magic: 15, agility: 6 }
                },
                {
                    name: 'Elf Archer',
                    level: profile.level + 1, 
                    stats: { attack: 10, defense: 6, magic: 8, agility: 12 }
                },
                {
                    name: 'Dragon Knight',
                    level: profile.level + 3,
                    stats: { attack: 18, defense: 12, magic: 10, agility: 8 }
                }
            ];
            
            // Seleccionar oponente apropiado
            const availableOpponents = aiOpponents.filter(opp => opp.level <= profile.level + 3);
            const opponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
            
            // Calcular poder de combate
            const playerPower = profile.level * 10 + 
                              profile.stats.attack + 
                              profile.stats.defense + 
                              profile.stats.magic + 
                              profile.stats.agility;
                              
            const opponentPower = opponent.level * 10 + 
                                opponent.stats.attack + 
                                opponent.stats.defense + 
                                opponent.stats.magic + 
                                opponent.stats.agility;
            
            const totalPower = playerPower + opponentPower;
            const playerChance = playerPower / totalPower;
            
            // Simular batalla
            const rounds = [];
            let playerHP = 50 + (profile.level * 5);
            let opponentHP = 50 + (opponent.level * 5);
            
            for (let i = 0; i < 5; i++) {
                if (playerHP <= 0 || opponentHP <= 0) break;
                
                const playerDamage = Math.floor(profile.stats.attack * (0.8 + Math.random() * 0.4));
                const opponentDamage = Math.floor(opponent.stats.attack * (0.8 + Math.random() * 0.4));
                
                opponentHP -= playerDamage;
                playerHP -= opponentDamage;
                
                rounds.push({
                    round: i + 1,
                    playerDamage,
                    opponentDamage,
                    playerHP: Math.max(0, playerHP),
                    opponentHP: Math.max(0, opponentHP)
                });
            }
            
            const playerWins = playerHP > opponentHP;
            
            // Calcular recompensas
            let expReward = Math.floor(opponent.level * 2);
            let goldReward = Math.floor(opponent.level * 1.5);
            
            if (playerWins) {
                expReward *= 2;
                goldReward *= 2;
                rpgUtil.addExperience(userId, expReward);
                rpgUtil.addGold(userId, goldReward);
            }
            
            const embed = new EmbedBuilder()
                .setColor(playerWins ? 0x00ff00 : 0xff0000)
                .setTitle('⚔️ Duel Results')
                .setDescription(`You dueled against **${opponent.name}** (Level ${opponent.level})`)
                .addFields(
                    {
                        name: '🏆 Result',
                        value: playerWins ? '**Victory!** 🎉' : '**Defeat!** 💀',
                        inline: true
                    },
                    {
                        name: '❤️ Final HP',
                        value: `You: ${Math.max(0, playerHP)} | Opponent: ${Math.max(0, opponentHP)}`,
                        inline: true
                    }
                );
            
            if (playerWins) {
                embed.addFields(
                    {
                        name: '⭐ EXP Gained',
                        value: `**+${expReward}** EXP`,
                        inline: true
                    },
                    {
                        name: '💰 Gold Earned',
                        value: `**+${goldReward}** gold`,
                        inline: true
                    }
                );
            }
            
            // Añadir resumen de rondas
            if (rounds.length > 0) {
                const lastRound = rounds[rounds.length - 1];
                embed.addFields({
                    name: '⚡ Battle Summary',
                    value: `The duel lasted **${rounds.length} rounds**\nFinal blow: **${lastRound.playerDamage}** damage`
                });
            }
            
            embed.setFooter({ 
                text: `${playerWins ? 'Congratulations' : 'Better luck next time'}! • Developed by LordK`,
                iconURL: interaction.client.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in duel command:', error);
            await interaction.reply({
                content: '❌ Error starting the duel. Please try again later.',
                ephemeral: true
            });
        }
    }
};