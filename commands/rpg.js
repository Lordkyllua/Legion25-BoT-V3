const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Player } = require('../models/Player');
const RPGUtils = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('Crear o ver tu personaje RPG'),
    
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const userId = interaction.user.id;

            // Buscar o crear jugador
            let player = await Player.findOne({ userId });
            const isNew = !player;
            
            if (!player) {
                player = await RPGUtils.createCharacter(userId, interaction.user.username);
            }

            const rpgEmbed = new EmbedBuilder()
                .setTitle(isNew ? '🎮 ¡Personaje Creado!' : '👤 Tu Personaje RPG')
                .setDescription(isNew ? 
                    `¡Bienvenido al mundo RPG, ${interaction.user.username}!` : 
                    `Estadísticas de ${interaction.user.username}`)
                .addFields(
                    { name: '👤 Nombre', value: player.username, inline: true },
                    { name: '⚔️ Clase', value: player.class, inline: true },
                    { name: '⭐ Nivel', value: `Nivel ${player.level}`, inline: true },
                    { name: '❤️ HP', value: `${player.currentHp}/${player.hp}`, inline: true },
                    { name: '🔵 MP', value: `${player.currentMp}/${player.mp}`, inline: true },
                    { name: '📊 EXP', value: `${player.exp}/${player.maxExp}`, inline: true },
                    { name: '💪 Fuerza', value: player.strength.toString(), inline: true },
                    { name: '🛡️ Defensa', value: player.defense.toString(), inline: true },
                    { name: '🔮 Magia', value: player.magic.toString(), inline: true },
                    { name: '⚡ Agilidad', value: player.agility.toString(), inline: true },
                    { name: '💰 Oro', value: (player.gold || 0).toString(), inline: true },
                    { name: '🏆 Evolución', value: player.evolution, inline: true }
                )
                .setColor(0x0099FF)
                .setTimestamp()
                .setFooter({ 
                    text: `Misiones: ${player.questsCompleted || 0} | Monstruos: ${player.monstersDefeated || 0}` 
                });

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('rpg_inventory')
                    .setLabel('🎒 Inventario')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('rpg_skills')
                    .setLabel('✨ Habilidades')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('rpg_quests')
                    .setLabel('🏹 Misiones')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({
                embeds: [rpgEmbed],
                components: [buttons]
            });

        } catch (error) {
            console.error('Error in rpg command:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al crear/ver tu personaje. Por favor, intenta nuevamente.',
                components: []
            });
        }
    }
};