module.exports = {
    customId: 'refresh_roles',
    async execute(interaction) {
        await interaction.update({ 
            content: '🔄 Roles refreshed!', 
            components: [] 
        });
    },
};