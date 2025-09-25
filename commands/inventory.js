const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Shows your inventory'),
  
  async execute(interaction) {
    const database = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    const userId = interaction.user.id;
    const user = database.users[userId];
    
    if (!user || !user.inventory || user.inventory.length === 0) {
      return interaction.reply('🎒 Your inventory is empty! Visit `/shop` to buy items.');
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🎒 Your Inventory')
      .setColor(0x00FF00)
      .setDescription('Here are all the items you own:')
      .addFields(
        user.inventory.map((item, index) => ({
          name: `${index + 1}. ${item.name}`,
          value: `Type: ${item.type} | Category: ${item.category || 'General'}`,
          inline: true
        }))
      )
      .setFooter({ 
        text: 'Bot developed by LordK', 
        iconURL: interaction.client.user.displayAvatarURL() 
      });

    await interaction.reply({ embeds: [embed] });
  }
};