const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('evolution')
        .setDescription('Evolve your class to more powerful forms'),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const evolutionInfo = rpgUtil.getAvailableEvolutions(userId);
            
            if (!evolutionInfo.success) {
                return await interaction.reply({
                    content: evolutionInfo.message,
                    ephemeral: true
                });
            }
            
            if (!evolutionInfo.hasEvolutions) {
                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle('📊 Evolution Progress')
                    .setDescription('You do not have any evolutions available yet. Keep leveling up!')
                    .addFields(
                        {
                            name: '📈 Next Evolutions',
                            value: '• **Level 25:** First evolution\n• **Level 50:** Second evolution\n• **Level 75:** Final evolution\n• **Level 100:** Maximum mastery'
                        },
                        {
                            name: '💡 Tip',
                            value: 'Use `/quest` frequently to level up faster!'
                        }
                    )
                    .setFooter({ text: 'Developed by LordK • Evolution System' });

                return await interaction.reply({ embeds: [embed] });
            }
            
            const evolutionLevel = Object.keys(evolutionInfo.availableEvolutions)[0];
            const evolutionOptions = evolutionInfo.availableEvolutions[evolutionLevel];
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🌟 Evolution Available!')
                .setDescription(`You have reached level ${evolutionLevel} and can evolve your class.`)
                .addFields(
                    {
                        name: '📊 Your Progress',
                        value: `**Current Class:** ${evolutionInfo.currentEvolutionLevel > 0 ? 'Evolved' : 'Base'}\n**Evolution Level:** ${evolutionInfo.currentEvolutionLevel}\n**Current Level:** ${(await rpgUtil.getUserProfile(userId)).level}`
                    }
                );
            
            evolutionOptions.forEach((evo, index) => {
                embed.addFields({
                    name: `🔄 Option ${index + 1}: ${evo.name}`,
                    value: `**Description:** ${evo.description}\n**Skills:** ${evo.skills.join(', ')}\n**Special:** ${evo.special}\n**Bonus:** ${Object.entries(evo.stats).map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`).join(', ')}`,
                    inline: false
                });
            });
            
            embed.setFooter({ text: 'Use /evolve <number> to choose your evolution • Developed by LordK' });

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in evolution command:', error);
            await interaction.reply({
                content: '❌ Error loading evolution information.',
                ephemeral: true
            });
        }
    }
};