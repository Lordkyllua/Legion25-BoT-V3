const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('evolve')
        .setDescription('Choose a specific evolution for your class')
        .addIntegerOption(option =>
            option.setName('option')
                .setDescription('The number of the evolution you want (1 or 2)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(2)),
    
    async execute(interaction) {
        try {
            const option = interaction.options.getInteger('option') - 1;
            const userId = interaction.user.id;
            
            const result = rpgUtil.evolveClass(userId, option);
            
            if (result.success) {
                const embed = new EmbedBuilder()
                    .setColor(0x9B59B6)
                    .setTitle('✨ Evolution Successful!')
                    .setDescription(result.message)
                    .addFields(
                        {
                            name: '🆕 New Class',
                            value: `**${result.evolution.name}**\n${result.evolution.description}`,
                            inline: false
                        },
                        {
                            name: '⚡ New Skills',
                            value: result.evolution.skills.map(skill => `• ${skill}`).join('\n'),
                            inline: true
                        },
                        {
                            name: '🌟 Specialty',
                            value: result.evolution.special,
                            inline: true
                        },
                        {
                            name: '📈 Bonuses',
                            value: Object.entries(result.evolution.stats)
                                .map(([stat, value]) => `**${stat}:** ${value > 0 ? '+' : ''}${value}`)
                                .join('\n'),
                            inline: true
                        }
                    )
                    .setFooter({ 
                        text: `Congratulations! You are now more powerful • Level ${result.level} • Developed by LordK`,
                        iconURL: interaction.user.displayAvatarURL() 
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({
                    content: result.message,
                    ephemeral: true
                });
            }
            
        } catch (error) {
            console.error('Error in evolve command:', error);
            await interaction.reply({
                content: '❌ Error evolving. Try again later.',
                ephemeral: true
            });
        }
    }
};