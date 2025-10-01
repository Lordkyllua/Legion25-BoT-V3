const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Player } = require('../../models/Player');
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
                const createResult = await RPGUtils.createCharacter(userId, interaction.user.username);
                if (!createResult) {
                    return await interaction.editReply({
                        content: '❌ Error al crear tu personaje. Por favor, intenta nuevamente.',
                        ephemeral: true
                    });
                }
                player = createResult;
            }

            // Iniciar misión
            const questEmbed = new EmbedBuilder()
                .setTitle(`🏹 Misión ${difficulty.toUpperCase()} Iniciada`)
                .setDescription(`¡${interaction.user.username} ha comenzado una misión ${difficulty}!`)
                .addFields(
                    { name: 'Dificultad', value: difficulty, inline: true },
                    { name: 'Jugador', value: player.username, inline: true },
                    { name: 'Clase', value: player.class, inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            // Simular progreso de misión (3 segundos)
            const progressEmbed = new EmbedBuilder()
                .setTitle('⏳ Progreso de la Misión')
                .setDescription('Completando misión...')
                .setColor(0xFFFF00)
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