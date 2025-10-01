const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Player = require('../../models/Player');
const RPGUtils = require('../../utils/rpg');

module.exports = {
    data: { name: 'rpg_class_selection' },
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const selectedClass = interaction.values[0];
            const userId = interaction.user.id;

            // Verificar si el jugador ya existe
            const existingPlayer = await Player.findOne({ userId });
            if (existingPlayer) {
                return await interaction.editReply({
                    content: '❌ Ya tienes un personaje creado. Usa `/resetcharacter` si quieres crear uno nuevo.',
                    ephemeral: true
                });
            }

            // Crear personaje con la clase seleccionada
            const player = await RPGUtils.createCharacter(userId, interaction.user.username, selectedClass);

            const classInfo = {
                warrior: {
                    description: 'Un guerrero fuerte y resistente, especializado en combate cuerpo a cuerpo.',
                    strengths: 'Alta fuerza y defensa, mucho HP'
                },
                mage: {
                    description: 'Un mago poderoso que domina las artes arcanas.',
                    strengths: 'Alta magia y MP, hechizos poderosos'
                },
                rogue: {
                    description: 'Un sigiloso ladrón experto en ataques rápidos y evasión.',
                    strengths: 'Alta agilidad y ataque, críticos frecuentes'
                }
            };

            const info = classInfo[selectedClass] || classInfo.warrior;

            const embed = new EmbedBuilder()
                .setTitle(`🎮 ¡Personaje ${selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1)} Creado!`)
                .setDescription(`¡Bienvenido al mundo RPG, ${interaction.user.username}!`)
                .addFields(
                    { name: '👤 Clase', value: selectedClass, inline: true },
                    { name: '⭐ Nivel', value: '1', inline: true },
                    { name: '🏆 Evolución', value: player.evolution, inline: true },
                    { name: '📖 Descripción', value: info.description, inline: false },
                    { name: '💪 Fortalezas', value: info.strengths, inline: false },
                    { name: '❤️ HP', value: `${player.hp}`, inline: true },
                    { name: '🔵 MP', value: `${player.mp}`, inline: true },
                    { name: '⚔️ Ataque', value: `${player.attack}`, inline: true },
                    { name: '🛡️ Defensa', value: `${player.defense}`, inline: true },
                    { name: '🔮 Magia', value: `${player.magic}`, inline: true },
                    { name: '⚡ Agilidad', value: `${player.agility}`, inline: true },
                    { name: '💪 Fuerza', value: `${player.strength}`, inline: true }
                )
                .setColor(0x0099FF)
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('rpg_inventory')
                    .setLabel('🎒 Ver Inventario')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('rpg_skills')
                    .setLabel('✨ Ver Habilidades')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('rpg_quests')
                    .setLabel('🏹 Ir de Misiones')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({
                embeds: [embed],
                components: [buttons]
            });

        } catch (error) {
            console.error('Error in rpg class selection:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al crear tu personaje. Por favor, intenta nuevamente.',
                ephemeral: true
            });
        }
    }
};