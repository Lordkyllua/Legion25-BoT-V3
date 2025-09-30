const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addExperience } = require('../../utils/rpg');
const { addGold } = require('../../utils/gold');
const User = require('../../models/User');
const { calculateDamage, createBattleEmbed } = require('../../commands/fight');

module.exports = {
    customId: 'fight_special_',
    async execute(interaction) {
        // Extraer el tipo de batalla del customId (monster, boss, elite)
        const battleType = interaction.customId.replace('fight_special_', '');
        const userId = interaction.user.id;
        const battleData = interaction.client.battleData?.[userId];

        if (!battleData) {
            await interaction.reply({ 
                content: 'Battle data not found. Start a new fight with `/fight`.', 
                ephemeral: true 
            });
            return;
        }

        let { player, enemy, type } = battleData;
        
        // Player special attack (costs MP)
        if (player.mp < 20) {
            await interaction.reply({ 
                content: 'Not enough MP for special attack! Use normal attack.', 
                ephemeral: true 
            });
            return;
        }

        // Deduct MP
        player.mp -= 20;
        
        const playerAttack = calculateDamage(player, enemy, true);
        enemy.currentHp -= playerAttack.damage;

        let battleLog = `💥 **${interaction.user.username}** uses Special Attack!\n`;
        battleLog += `Consumed 20 MP. Dealt **${playerAttack.damage}** damage!\n`;

        // Check if enemy is defeated
        if (enemy.currentHp <= 0) {
            await handleVictory(interaction, player, enemy, type, battleLog);
            delete interaction.client.battleData[userId];
            return;
        }

        // Enemy attack
        const enemyAttack = calculateDamage(enemy, player);
        player.currentHp -= enemyAttack.damage;

        battleLog += `\n🦹 **${enemy.name}** counterattacks!\n`;
        battleLog += `Dealt **${enemyAttack.damage}** damage.\n`;

        // Check if player is defeated
        if (player.currentHp <= 0) {
            await handleDefeat(interaction, enemy, battleLog);
            delete interaction.client.battleData[userId];
            return;
        }

        // Update battle data
        battleData.player.currentHp = player.currentHp;
        battleData.player.mp = player.mp;
        battleData.enemy.currentHp = enemy.currentHp;
        interaction.client.battleData[userId] = battleData;

        // Continue battle
        const embed = createBattleEmbed(interaction, player, enemy, '💥 Special Attack!');
        embed.addFields({
            name: '📜 Battle Log',
            value: battleLog,
            inline: false
        });

        const attackButton = new ButtonBuilder()
            .setCustomId(`fight_attack_${type}`)
            .setLabel('Attack')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('⚔️');

        const specialButton = new ButtonBuilder()
            .setCustomId(`fight_special_${type}`)
            .setLabel('Special Attack')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('💥')
            .setDisabled(player.mp < 20); // Disable if not enough MP

        const fleeButton = new ButtonBuilder()
            .setCustomId('fight_flee')
            .setLabel('Flee')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🏃‍♂️');

        const row = new ActionRowBuilder().addComponents(attackButton, specialButton, fleeButton);

        await interaction.update({ 
            embeds: [embed], 
            components: [row] 
        });
    },
};

async function handleVictory(interaction, player, enemy, type, battleLog) {
    const userId = interaction.user.id;
    
    const expReward = type === 'boss' ? enemy.exp * 2 : enemy.exp;
    const goldReward = type === 'boss' ? enemy.gold * 3 : enemy.gold;
    
    try {
        await addExperience(userId, expReward);
        await addGold(userId, goldReward);
        
        const user = await User.findById(userId);
        if (user && user.rpg) {
            user.rpg.monstersDefeated = (user.rpg.monstersDefeated || 0) + 1;
            await User.updateRPG(userId, user.rpg);
        }

        const victoryEmbed = new EmbedBuilder()
            .setTitle('🎉 Victory!')
            .setColor(0x00FF00)
            .setDescription(`You defeated **${enemy.name}** with a special attack!`)
            .addFields(
                { name: '🏆 Rewards', value: `⭐ ${expReward} EXP\n🪙 ${goldReward} Gold`, inline: true },
                { name: '💀 Enemy', value: enemy.name, inline: true },
                { name: '📜 Battle Log', value: battleLog, inline: false }
            )
            .setFooter({ text: 'Excellent use of special attack!' });

        await interaction.update({ 
            embeds: [victoryEmbed], 
            components: [] 
        });
    } catch (error) {
        console.error('Error in handleVictory:', error);
        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Error')
            .setColor(0xFF0000)
            .setDescription('There was an error processing your victory rewards.')
            .setFooter({ text: 'Please try again later.' });

        await interaction.update({ 
            embeds: [errorEmbed], 
            components: [] 
        });
    }
}

async function handleDefeat(interaction, enemy, battleLog) {
    const defeatEmbed = new EmbedBuilder()
        .setTitle('💀 Defeat')
        .setColor(0xFF0000)
        .setDescription(`You were defeated by **${enemy.name}**!`)
        .addFields(
            { name: '💀 Enemy', value: enemy.name, inline: true },
            { name: '📜 Battle Log', value: battleLog, inline: false }
        )
        .setFooter({ text: 'Your special attack wasn\'t enough...' });

    await interaction.update({ 
        embeds: [defeatEmbed], 
        components: [] 
    });
}