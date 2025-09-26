const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boss')
        .setDescription('Fight against powerful bosses for epic rewards'),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const profile = rpgUtil.getUserProfile(userId);
            
            // Jefes disponibles basados en nivel
            const bosses = [
                {
                    name: '🐉 Ancient Dragon',
                    level: 20,
                    hp: 500,
                    reward: { exp: 100, gold: 200, item: 'Dragon Scale' },
                    description: 'A legendary dragon that guards ancient treasures'
                },
                {
                    name: '👑 Lich King', 
                    level: 25,
                    hp: 600,
                    reward: { exp: 150, gold: 300, item: 'Crown of the Lich' },
                    description: 'An undead monarch with powerful dark magic'
                },
                {
                    name: '🌊 Kraken',
                    level: 30,
                    hp: 700,
                    reward: { exp: 200, gold: 400, item: 'Kraken Tentacle' },
                    description: 'A massive sea monster that terrorizes sailors'
                },
                {
                    name: '🔥 Phoenix',
                    level: 35, 
                    hp: 800,
                    reward: { exp: 250, gold: 500, item: 'Phoenix Feather' },
                    description: 'A mythical bird that rises from its own ashes'
                }
            ];
            
            // Filtrar jefes disponibles
            const availableBosses = bosses.filter(boss => profile.level >= boss.level - 5);
            
            if (availableBosses.length === 0) {
                return await interaction.reply({
                    content: '❌ You need to be at least level 15 to challenge bosses!',
                    ephemeral: true
                });
            }
            
            // Seleccionar jefe aleatorio
            const boss = availableBosses[Math.floor(Math.random() * availableBosses.length)];
            
            // Simular batalla contra el jefe
            let bossHP = boss.hp;
            let playerHP = 100 + (profile.level * 10);
            let rounds = 0;
            let totalDamage = 0;
            
            while (bossHP > 0 && playerHP > 0 && rounds < 20) {
                rounds++;
                
                // Daño del jugador
                const playerDamage = Math.floor(
                    (profile.stats.attack + profile.stats.magic) * 
                    (0.5 + Math.random() * 0.5)
                );
                bossHP -= playerDamage;
                totalDamage += playerDamage;
                
                // Daño del jefe (solo si sigue vivo)
                if (bossHP > 0) {
                    const bossDamage = Math.floor(20 + (boss.level * 2) * Math.random());
                    playerHP -= bossDamage;
                }
            }
            
            const victory = bossHP <= 0;
            
            const embed = new EmbedBuilder()
                .setColor(victory ? 0xffd700 : 0xff0000)
                .setTitle(victory ? '🎉 Boss Defeated!' : '💀 Boss Battle Failed')
                .setDescription(`You challenged **${boss.name}** (Level ${boss.level})`)
                .addFields(
                    {
                        name: '❤️ Boss HP',
                        value: victory ? '**0/500** ☠️' : `**${Math.max(0, bossHP)}/500** 💔`,
                        inline: true
                    },
                    {
                        name: '❤️ Your HP',
                        value: `**${Math.max(0, playerHP)}/${100 + (profile.level * 10)}**`,
                        inline: true
                    },
                    {
                        name: '⚡ Rounds',
                        value: `**${rounds}** rounds fought`,
                        inline: true
                    }
                );
            
            if (victory) {
                // Recompensas por victoria
                const expReward = boss.reward.exp;
                const goldReward = boss.reward.gold;
                
                rpgUtil.addExperience(userId, expReward);
                rpgUtil.addGold(userId, goldReward);
                
                embed.addFields(
                    {
                        name: '⭐ EXP Reward',
                        value: `**+${expReward}** EXP`,
                        inline: true
                    },
                    {
                        name: '💰 Gold Reward',
                        value: `**+${goldReward}** gold`,
                        inline: true
                    },
                    {
                        name: '🎁 Special Item',
                        value: `**${boss.reward.item}** obtained!`,
                        inline: true
                    }
                );
            } else {
                embed.addFields({
                    name: '💡 Tip',
                    value: 'Level up and improve your gear before challenging this boss again!'
                });
            }
            
            embed.setFooter({ 
                text: `${victory ? 'Epic victory!' : 'Brave effort!'} • Developed by LordK`,
                iconURL: interaction.client.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in boss command:', error);
            await interaction.reply({
                content: '❌ Error challenging the boss. Please try again later.',
                ephemeral: true
            });
        }
    }
};