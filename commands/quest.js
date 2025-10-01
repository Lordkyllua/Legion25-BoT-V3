const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Player } = require('../models/Player');
const RPGUtils = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Ver y comenzar misiones disponibles'),
    
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const userId = interaction.user.id;

            // Buscar o crear jugador
            let player = await Player.findOne({ userId });
            if (!player) {
                player = await RPGUtils.createCharacter(userId, interaction.user.username);
            }

            const questsEmbed = new EmbedBuilder()
                .setTitle('🏹 Misiones Disponibles')
                .setDescription('Selecciona una misión para comenzar tu aventura!')
                .addFields(
                    {
                        name: '🟢 Misión Fácil',
                        value: 'Recompensa: 20 EXP, 15 Oro\nRequisitos: Ninguno',
                        inline: false
                    },
                    {
                        name: '🟡 Misión Media', 
                        value: 'Recompensa: 40 EXP, 30 Oro\nRequisitos: Nivel 3+',
                        inline: false
                    },
                    {
                        name: '🔴 Misión Difícil',
                        value: 'Recompensa: 80 EXP, 60 Oro\nRequisitos: Nivel 6+',
                        inline: false
                    }
                )
                .setColor(0x00FF00)
                .setTimestamp()
                .setFooter({ text: `Misiones completadas: ${player.questsCompleted || 0}` });

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('start_quest_easy')
                    .setLabel('🟢 Fácil')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('start_quest_medium')
                    .setLabel('🟡 Media')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(player.level < 3),
                new ButtonBuilder()
                    .setCustomId('start_quest_hard')
                    .setLabel('🔴 Difícil')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(player.level < 6)
            );

            await interaction.editReply({
                embeds: [questsEmbed],
                components: [buttons]
            });

        } catch (error) {
            console.error('Error in quest command:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al cargar las misiones. Por favor, intenta nuevamente.',
                components: []
            });
        }
    }
};