const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Player } = require('../models/Player');
const RPGUtils = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Iniciar una batalla contra un monstruo')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Tipo de enemigo')
                .setRequired(true)
                .addChoices(
                    { name: 'Monstruo', value: 'monster' },
                    { name: 'Jefe', value: 'boss' }
                )),
    
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const enemyType = interaction.options.getString('type');
            const userId = interaction.user.id;

            // Buscar o crear jugador
            let player = await Player.findOne({ userId });
            if (!player) {
                player = await RPGUtils.createCharacter(userId, interaction.user.username);
            }

            // Crear batalla
            const battle = await RPGUtils.createBattle(player._id, enemyType);

            const battleEmbed = new EmbedBuilder()
                .setTitle('⚔️ ¡Batalla Iniciada!')
                .setDescription(`**${player.username}** vs **${battle.enemy.name}**`)
                .addFields(
                    { 
                        name: '👤 Jugador', 
                        value: `HP: ${player.currentHp}/${player.hp}\nNivel: ${player.level}\nClase: ${player.class}`,
                        inline: true 
                    },
                    { 
                        name: '👹 Enemigo', 
                        value: `HP: ${battle.enemy.hp}\nNivel: ${battle.enemy.level}\nTipo: ${battle.enemy.name}`,
                        inline: true 
                    }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`fight_attack_${enemyType}`)
                    .setLabel('⚔️ Atacar')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`fight_special_${enemyType}`)
                    .setLabel('✨ Ataque Especial')
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
            console.error('Error in fight command:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al iniciar la batalla. Por favor, intenta nuevamente.',
                components: []
            });
        }
    }
};