const fs = require('fs');
const clansUtil = require('../utils/clans');

module.exports = {
  name: 'createclan',
  description: 'Create a new clan',
  execute(message, args) {
    if (args.length < 1) {
      return message.reply('Usage: !createclan <clan_name>');
    }
    
    const clanName = args.join(' ');
    const userId = message.author.id;
    
    try {
      clansUtil.createClan(clanName, userId);
      message.reply(`✅ Clan "${clanName}" created successfully!`);
    } catch (error) {
      message.reply(error.message);
    }
  }
};