const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'fight_flee',
    async execute(interaction) {
        const userId = interaction.user.id;
        
        // 70% chance to flee successfully
        const fleeSuccess = Math.random() < 0.7;
        
        if (fleeSuccess) {
            const fleeEmbed = new EmbedBuilder()
                .setTitle('🏃‍♂️ Successful Escape!')
                .setColor(0xF39C12)
                .setDescription('You managed to escape from the battle!')
                .setFooter({ text: 'Live to fight another day!' });

            await interaction.update({ 
                embeds: [fleeEmbed], 
                components: [] 
            });
        } else {
            const failedEmbed = new EmbedBuilder()
                .setTitle('❌ Escape Failed!')
                .setColor(0xE74C3C)
                .setDescription('You failed to escape! The enemy attacks you as you try to run!')
                .setFooter({ text: 'The enemy is too fast!' });

            await interaction.update({ 
                embeds: [failedEmbed], 
                components: [] 
            });
        }

        // Clean up battle data
        if (interaction.client.battleData) {
            delete interaction.client.battleData[userId];
        }
    },
};