const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Interactive shop with categories - Tiny Survivors themed'),
  
  async execute(interaction) {
    const store = JSON.parse(fs.readFileSync('store.json', 'utf8'));
    
    const categories = [...new Set(store.items.map(item => item.category || 'General'))];
    
    const categoryOptions = categories.map(category => ({
      label: category,
      value: category,
      description: `Browse ${category} items`
    }));
    
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('shopCategory')
      .setPlaceholder('Choose a category...')
      .addOptions(categoryOptions);
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    const embed = new EmbedBuilder()
      .setTitle('🛍️ Survivor\'s Market')
      .setDescription('Select a category to browse items. Survive, earn points, and upgrade your gear!')
      .setColor(0x00FF00)
      .addFields(
        categories.map(category => ({
          name: `🎯 ${category}`,
          value: `${store.items.filter(item => (item.category || 'General') === category).length} survival items available`,
          inline: true
        }))
      )
      .setFooter({ 
        text: 'Tiny Survivors inspired shop • Developed by LordK', 
        iconURL: interaction.client.user.displayAvatarURL() 
      })
      .setTimestamp();

    await interaction.reply({ 
      embeds: [embed], 
      components: [row] 
    });
  }
};