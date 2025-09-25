const fs = require('fs');

module.exports = {
  name: 'shopCategory',
  async execute(interaction) {
    const category = interaction.values[0];
    const store = JSON.parse(fs.readFileSync('store.json', 'utf8'));
    
    const categoryItems = store.items.filter(item => item.category === category);
    
    if (categoryItems.length === 0) {
      return interaction.reply({ 
        content: `No items found in category: ${category}`, 
        ephemeral: true 
      });
    }
    
    const embed = {
      title: `🛍️ ${category} Shop`,
      color: 0x00ff00,
      fields: categoryItems.map(item => ({
        name: `${item.name} - ${item.price} points`,
        value: `${item.description || 'No description'}\nID: ${item.id}`,
        inline: true
      })),
      timestamp: new Date().toISOString()
    };
    
    await interaction.update({ embeds: [embed] });
  }
};