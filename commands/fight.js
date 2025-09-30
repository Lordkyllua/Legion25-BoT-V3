const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addExperience } = require('../../utils/rpg');
const { addGold } = require('../../utils/gold');
const User = require('../../models/User');
const { calculateDamage, createBattleEmbed } = require('../../commands/fight');

module.exports = {
    customId: 'fight_attack_',
    async execute(interaction) {
        const battleType = interaction.customId.replace('fight_attack_', '');
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
        
        // Player attack
        const playerAttack = calculateDamage(player, enemy);
        enemy.currentHp -= playerAttack.damage;

        let battleLog = `⚔️ **${interaction.user.username}** attacks!\n`;
        if (playerAttack.isCritical) {
            battleLog += `💥 **CRITICAL HIT!** Dealt **${playerAttack.damage}** damage!\n`;
        } else {
            battleLog += `Dealt **${playerAttack.damage}** damage.\n`;
        }

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
        if (enemyAttack.isCritical) {
            battleLog += `💥 **CRITICAL HIT!** Dealt **${enemyAttack.damage}** damage!\n`;
        } else {
            battleLog += `Dealt **${enemyAttack.damage}** damage.\n`;
        }

        // Check if player is defeated
        if (player.currentHp <= 0) {
            await handleDefeat(interaction, enemy, battleLog);
            delete interaction.client.battleData[userId];
            return;
        }

        // Update battle data
        battleData.player.currentHp = player.currentHp;
        battleData.enemy.currentHp = enemy.currentHp;
        interaction.client.battleData[userId] = battleData;

        // Continue battle
        const embed = createBattleEmbed(interaction, player, enemy, '⚔️ Battle Continues!');
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
            .setEmoji('💥');

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
    
    // Calculate rewards
    const expReward = type === 'boss' ? enemy.exp * 2 : enemy.exp;
    const goldReward = type === 'boss' ? enemy.gold * 3 : enemy.gold;
    
    try {
        // Add rewards
        await addExperience(userId, expReward);
        await addGold(userId, goldReward);
        
        // Update user statistics
        const user = await User.findById(userId);
        if (user && user.rpg) {
            user.rpg.monstersDefeated = (user.rpg.monstersDefeated || 0) + 1;
            await User.updateRPG(userId, user.rpg);
        }

        const victoryEmbed = new EmbedBuilder()
            .setTitle('🎉 Victory!')
            .setColor(0x00FF00)
            .setDescription(`You defeated **${enemy.name}**!`)
            .addFields(
                { name: '🏆 Rewards', value: `⭐ ${expReward} EXP\n🪙 ${goldReward} Gold`, inline: true },
                { name: '💀 Enemy', value: enemy.name, inline: true },
                { name: '📜 Battle Log', value: battleLog, inline: false }
            )
            .setFooter({ text: 'Great battle! Your rewards have been added.' });

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
            { name: '🏥 Status', value: 'You need to recover your health', inline: true },
            { name: '📜 Battle Log', value: battleLog, inline: false }
        )
        .setFooter({ text: 'Better luck next time! Use /rpg to check your status.' });

    await interaction.update({ 
        embeds: [defeatEmbed], 
        components: [] 
    });
}