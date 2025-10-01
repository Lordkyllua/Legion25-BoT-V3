const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Battle } = require('../../models/Battle');
const { Player } = require('../../models/Player');
const RPGUtils = require('../../utils/rpg');

async function handleVictory(interaction, battle, player) {
    try {
        const victoryResult = await RPGUtils.handleBattleVictory(player._id, battle);
        
        if (!victoryResult.success) {
            throw new Error(victoryResult.error);
        }

        const victoryEmbed = new EmbedBuilder()
            .setTitle('🎉 ¡Victoria!')
            .setDescription(`¡${player.username} ha derrotado al ${battle.enemy.name}!`)
            .addFields(
                { name: 'Experiencia Obtenida', value: `+${battle.enemy.exp} EXP`, inline: true },
                { name: 'Oro Obtenido', value: `+${battle.enemy.gold} 🪙`, inline: true },
                { name: 'Nivel Actual', value: `Nivel ${victoryResult.player.level}`, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        // Verificar si subió de nivel
        if (victoryResult.player.exp === 0) {
            victoryEmbed.addFields({
                name: '🎊 ¡Subiste de Nivel!',
                value: `¡Ahora eres nivel ${victoryResult.player.level}!`,
                inline: false
            });
        }

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('fight_attack_monster')
                .setLabel('⚔️ Atacar de Nuevo')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('rpg_inventory')
                .setLabel('🎒 Inventario')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.editReply({
            embeds: [victoryEmbed],
            components: [buttons]
        });

        // Eliminar la batalla
        await Battle.findByIdAndDelete(battle._id);

    } catch (error) {
        console.error('Error in handleVictory:', error);
        throw error;
    }
}

async function handleDefeat(interaction, player) {
    const defeatEmbed = new EmbedBuilder()
        .setTitle('💀 Derrota')
        .setDescription(`¡${player.username} ha sido derrotado en batalla!`)
        .addFields(
            { name: 'Consecuencias', value: 'Has perdido 10 de oro por la derrota.', inline: true },
            { name: 'HP Actual', value: `${player.currentHp}/${player.hp}`, inline: true }
        )
        .setColor(0xFF0000)
        .setTimestamp();

    // Penalización por derrota
    player.gold = Math.max(0, (player.gold || 0) - 10);
    player.currentHp = player.hp; // Restaurar HP
    await player.save();

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('fight_attack_monster')
            .setLabel('⚔️ Intentar de Nuevo')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('rpg_inventory')
            .setLabel('🎒 Usar Poción')
            .setStyle(ButtonStyle.Success)
    );

    await interaction.editReply({
        embeds: [defeatEmbed],
        components: [buttons]
    });
}

module.exports = {
    data: { name: 'fight_attack_' },
    
    async execute(interaction) {
        try {
            await interaction.deferUpdate();

            const userId = interaction.user.id;
            const battleType = interaction.customId.replace('fight_attack_', '');

            // Buscar batalla activa
            let battle = await Battle.findOne({ playerId: userId });
            
            if (!battle) {
                // Crear nueva batalla si no existe
                battle = await RPGUtils.createBattle(userId, battleType);
            }

            const player = await Player.findById(battle.playerId);
            if (!player) {
                return await interaction.editReply({
                    content: '❌ No se encontró tu personaje. Usa `/rpg` para crear uno.',
                    components: []
                });
            }

            // Jugador ataca
            const playerDamage = RPGUtils.calculateDamage(player, battle.enemy);
            battle.enemy.currentHp -= playerDamage;

            const battleEmbed = new EmbedBuilder()
                .setTitle('⚔️ Batalla en Progreso')
                .setDescription(`**${player.username}** vs **${battle.enemy.name}**`)
                .addFields(
                    { 
                        name: '👤 Jugador', 
                        value: `HP: ${player.currentHp}/${player.hp}\nDaño: ${playerDamage}`,
                        inline: true 
                    },
                    { 
                        name: '👹 Enemigo', 
                        value: `HP: ${battle.enemy.currentHp}/${battle.enemy.hp}`,
                        inline: true 
                    }
                )
                .setColor(0xFFA500)
                .setTimestamp();

            // Verificar si el enemigo fue derrotado
            if (battle.enemy.currentHp <= 0) {
                battle.enemy.currentHp = 0;
                await battle.save();
                return await handleVictory(interaction, battle, player);
            }

            // Enemigo contraataca
            const enemyDamage = RPGUtils.calculateDamage(battle.enemy, player);
            player.currentHp -= enemyDamage;

            battleEmbed.addFields({
                name: '💥 Contraataque',
                value: `**${battle.enemy.name}** te ataca por **${enemyDamage}** de daño!`,
                inline: false
            });

            // Verificar si el jugador fue derrotado
            if (player.currentHp <= 0) {
                player.currentHp = 0;
                await player.save();
                await battle.save();
                return await handleDefeat(interaction, player);
            }

            await player.save();
            await battle.save();

            // Actualizar componentes de botones
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('fight_attack_monster')
                    .setLabel('⚔️ Atacar')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('fight_special_monster')
                    .setLabel('✨ Ataque Especial')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('fight_flee')
                    .setLabel('🏃‍♂️ Huir')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({
                embeds: [battleEmbed],
                components: [buttons]
            });

        } catch (error) {
            console.error('Error in fightAttack button:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error durante la batalla. Por favor, intenta nuevamente.',
                components: []
            });
        }
    }
};