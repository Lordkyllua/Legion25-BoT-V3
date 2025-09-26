const { SlashCommandBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop using your gold')
    .addIntegerOption(option =>
      option.setName('item_id')
        .setDescription('The ID of the item to buy')
        .setRequired(true)),
  
  async execute(interaction) {
    try {
      const itemId = interaction.options.getInteger('item_id');
      
      // Usar la función buyItem de rpg.js que maneja oro y validaciones
      const result = rpgUtil.buyItem(interaction.user.id, itemId);
      
      if (result.success) {
        await interaction.reply({
          content: `✅ ${result.message}`,
          ephemeral: false
        });
      } else {
        await interaction.reply({
          content: `❌ ${result.message}`,
          ephemeral: true
        });
      }
      
    } catch (error) {
      console.error('Error in buy command:', error);
      await interaction.reply({
        content: '❌ Error processing your purchase. Please try again.',
        ephemeral: true
      });
    }
  }
};