const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'helpNavigation',
  async execute(interaction, client) {
    const page = interaction.customId.split('_')[1];
    const commands = Array.from(client.commands.values());
    const pages = Math.ceil(commands.length / 5);
    
    const startIndex = (parseInt(page) - 1) * 5;
    const endIndex = startIndex + 5;
    const pageCommands = commands.slice(startIndex, endIndex);
    
    const embed = new EmbedBuilder()
      .setTitle(`📚 Bot Commands - Page ${page}/${pages}`)
      .setColor(0x0099ff)
      .setDescription('Here are all available commands:')
      .addFields(
        pageCommands.map(cmd => ({
          name: `/${cmd.name}`,
          value: cmd.description || 'No description provided'
        }))
      )
      .setTimestamp()
      .setFooter({ 
        text: 'Bot developed by LordK • Inspired by Tiny Survivors', 
        iconURL: client.user.displayAvatarURL() 
      });
    
    const buttons = {
      type: 1,
      components: []
    };
    
    // Botón Anterior
    if (page > 1) {
      buttons.components.push({
        type: 2,
        label: '⬅️ Previous',
        style: 1,
        customId: `helpNavigation_${parseInt(page) - 1}`
      });
    }
    
    // Botón Siguiente
    if (page < pages) {
      buttons.components.push({
        type: 2,
        label: 'Next ➡️',
        style: 1,
        customId: `helpNavigation_${parseInt(page) + 1}`
      });
    }
    
    await interaction.update({ 
      embeds: [embed], 
      components: [buttons] 
    });
  }
};