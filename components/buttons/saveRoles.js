const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roles_save',
    
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Roles Saved')
            .setDescription('Your role preferences have been saved successfully!')
            .setColor(0x2ECC71)
            .setFooter({ text: 'Roles will be applied automatically' });

        await interaction.editReply({ embeds: [embed], components: [] });
    }
};