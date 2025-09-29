module.exports = {
    customId: 'save_roles',
    async execute(interaction) {
        await interaction.update({ 
            content: '✅ Roles saved successfully!', 
            components: [] 
        });
    },
};