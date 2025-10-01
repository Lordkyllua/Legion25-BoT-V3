const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Battle } = require('../../models/Battle');
const { Player } = require('../../models/Player');
const RPGUtils = require('../../utils/rpg');

module.exports = {
    data: { name: 'fight_special_' },
    
    async execute(interaction) {
        try {
            await interaction.deferUpdate();

            const userId = interaction.user.id;
            const battleType = interaction.customId.replace('fight_special_', '');

            // Buscar batalla activa
            let battle = await Battle.findOne({ playerId: userId });
            
            if (!battle) {
                battle = await RPGUtils.createBattle(userId, battleType);
            }

            const player = await Player.findById(battle.playerId);
            if (!player) {
                return await interaction.editReply({
                    content: '❌ No se encontró tu personaje.',
                    components: []
                });
            }

            // Verificar MP suficiente para ataque especial
            if (player.currentMp < 10) {
                return await interaction.editReply({
                    content: '❌ No tienes suficiente MP para un ataque especial.',
                    ephemeral: true
                });
            }

            // Jugador usa ataque especial
            player.currentMp -= 10;
            const specialDamage = RPGUtils.calculateDamage(player, battle.enemy, true);
            battle.enemy.currentHp -= specialDamage;

            const battleEmbed = new EmbedBuilder()
                .setTitle('✨ Ataque Especial')
                .setDescription(`**${player.username}** usa un ataque especial contra **${battle.enemy.name}**!`)
                .addFields(
                    { 
                        name: '👤 Jugador', 
                        value: `HP: ${player.currentHp}/${player.hp}\nMP: ${player.currentMp}/${player.mp}\nDaño: ${specialDamage} (Especial)`,
                        inline: true 
                    },
                    { 
                        name: '👹 Enemigo', 
                        value: `HP: ${battle.enemy.currentHp}/${battle.enemy.hp}`,
                        inline: true 
                    }
                )
                .setColor(0x800080)
                .setTimestamp();

            // Verificar si el enemigo fue derrotado
            if (battle.enemy.currentHp <= 0) {
                battle.enemy.currentHp = 0;
                await battle.save();
                
                // Usar la función handleVictory de fightAttack
                const fightAttack = require('./fightAttack');
                return await fightAttack.handleVictory(interaction, battle, player);
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
                
                // Usar la función handleDefeat de fightAttack
                const fightAttack = require('./fightAttack');
                return await fightAttack.handleDefeat(interaction, player);
            }

            await player.save();
            await battle.save();

            // Botones actualizados
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('fight_attack_monster')
                    .setLabel('⚔️ Atacar')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('fight_special_monster')
                    .label('✨ Ataque Especial')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(player.currentMp < 10),
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
            console.error('Error in fightSpecial button:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error durante el ataque especial.',
                components: []
            });
        }
    }
};