const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const pointsUtil = require('../utils/points');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop')
    .addIntegerOption(option =>
      option.setName('item_id')
        .setDescription('The ID of the item to buy')
        .setRequired(true)),
  
  async execute(interaction) {
    const itemId = interaction.options.getInteger('item_id');
    const store = JSON.parse(fs.readFileSync('store.json', 'utf8'));
    const item = store.items.find(i => i.id === itemId);
    
    if (!item) {
      return interaction.reply('❌ Item not found! Use `/shop` to see available items.');
    }
    
    const userId = interaction.user.id;
    const currentPoints = pointsUtil.getPoints(userId);
    
    if (currentPoints < item.price) {
      return interaction.reply(`❌ You don't have enough points! You need ${item.price} but have ${currentPoints}.`);
    }
    
    pointsUtil.removePoints(userId, item.price);
    
    const database = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    if (!database.users[userId]) database.users[userId] = { inventory: [] };
    database.users[userId].inventory.push(item);
    
    fs.writeFileSync('database.json', JSON.stringify(database, null, 2));
    interaction.reply(`✅ You purchased **${item.name}** for ${item.price} points!`);
  }
};