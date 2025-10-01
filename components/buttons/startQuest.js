const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Player = require('../../models/Player');
const RPGUtils = require('../../utils/rpg');

module.exports = {
    data: { name: 'start_quest_' },
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const difficulty = interaction.customId.replace('start_quest_', '');
            const userId = interaction.user.id;

            // Buscar o crear jugador
            let player = await Player.findOne({ userId });
            if (!player) {
                player = await RPGUtils.createCharacter(userId, interaction.user.username);
            }

            // Verificar requisitos de nivel para misiones
            if (difficulty === 'medium' && player.level < 3) {
                return await interaction.editReply({
                    content: '❌ Necesitas ser nivel 3 o superior para misiones medias.',
                    ephemeral: true
                });
            }

            if (difficulty === 'hard' && player.level < 6) {
                return await interaction.editReply({
                    content: '❌ Necesitas ser nivel 6 o superior para misiones difíciles.',
                    ephemeral: true
                });
            }

            // Iniciar misión
            const questEmbed = new EmbedBuilder()
                .setTitle(`🏹 Misión ${difficulty.toUpperCase()} Iniciada`)
                .setDescription(`¡${interaction.user.username} ha comenzado una misión ${difficulty}!`)
                .addFields(
                    { name: 'Dificultad', value: difficulty, inline: true },
                    { name: 'Jugador', value: player.username, inline: true },
                    { name: 'Clase', value: player.class, inline: true },
                    { name: 'Nivel', value: `Nivel ${player.level}`, inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            await interaction.editReply({ embeds: [questEmbed] });

            // Esperar 3 segundos para simular la misión
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Completar misión y dar recompensas
            const completeResult = await RPGUtils.completeQuest(player, difficulty);
            
            if (!completeResult.success) {
                return await interaction.editReply({
                    content: `❌ Error al completar la misión: ${completeResult.error}`,
                    ephemeral: true
                });
            }

            const completeEmbed = new EmbedBuilder()
                .setTitle('✅ Misión Completada')
                .setDescription(`¡${interaction.user.username} ha completado la misión ${difficulty} exitosamente!`)
                .addFields(
                    { name: 'Experiencia Obtenida', value: `+${completeResult.exp} EXP`, inline: true },
                    { name: 'Oro Obtenido', value: `+${completeResult.gold} 🪙`, inline: true },
                    { name: 'Nivel Actual', value: `Nivel ${player.level}`, inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            if (completeResult.levelUp) {
                completeEmbed.addFields({
                    name: '🎉 ¡Subiste de Nivel!',
                    value: `¡Ahora eres nivel ${player.level}!`,
                    inline: false
                });
            }

            await interaction.editReply({ 
                embeds: [questEmbed, completeEmbed] 
            });

        } catch (error) {
            console.error('Error in startQuest button:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al iniciar la misión. Por favor, intenta nuevamente.',
                ephemeral: true
            });
        }
    }
};