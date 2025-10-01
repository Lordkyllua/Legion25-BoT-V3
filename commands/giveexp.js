const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Player } = require('../models/Player');
const RPGUtils = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveexp')
        .setDescription('Dar experiencia a un jugador (Admin)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Usuario al que dar experiencia')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Cantidad de experiencia')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1000)),
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            // Verificar permisos de administrador
            if (!interaction.member.permissions.has('ADMINISTRATOR')) {
                return await interaction.editReply({
                    content: '❌ No tienes permisos para usar este comando.',
                    ephemeral: true
                });
            }

            const targetUser = interaction.options.getUser('user');
            const expAmount = interaction.options.getInteger('amount');

            // Buscar jugador
            let player = await Player.findOne({ userId: targetUser.id });
            if (!player) {
                player = await RPGUtils.createCharacter(targetUser.id, targetUser.username);
            }

            // Dar experiencia
            const result = await RPGUtils.addExperience(player, expAmount);

            const embed = new EmbedBuilder()
                .setTitle('⭐ Experiencia Otorgada')
                .setDescription(`Se ha dado ${expAmount} EXP a ${targetUser.username}`)
                .addFields(
                    { name: 'Experiencia Anterior', value: `${result.exp - expAmount} EXP`, inline: true },
                    { name: 'Experiencia Actual', value: `${result.exp} EXP`, inline: true },
                    { name: 'Nivel', value: `Nivel ${result.level}`, inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in giveexp command:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al dar experiencia.',
                ephemeral: true
            });
        }
    }
};