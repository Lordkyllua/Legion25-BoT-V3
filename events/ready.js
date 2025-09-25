const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client, logger) {
    const botName = client.user.tag;
    const serverCount = client.guilds.cache.size;
    const userCount = client.users.cache.size;
    
    logger.success(`Logged in as ${botName}`);
    logger.info(`Serving ${serverCount} servers and ${userCount} users`);
    
    // Beautiful status rotation
    const statuses = [
      { name: 'Tiny Survivors', type: ActivityType.Playing, emoji: '🎮' },
      { name: 'survival adventures', type: ActivityType.Playing, emoji: '⚔️' },
      { name: 'with clan battles', type: ActivityType.Competing, emoji: '🛡️' },
      { name: 'the item shop', type: ActivityType.Watching, emoji: '🛍️' },
      { name: `${serverCount} servers`, type: ActivityType.Watching, emoji: '🌐' },
      { name: '/help for commands', type: ActivityType.Listening, emoji: '📖' },
      { name: 'RPG quests', type: ActivityType.Playing, emoji: '🏹' },
      { name: 'wave survival', type: ActivityType.Streaming, emoji: '🌊' }
    ];

    let currentIndex = 0;
    
    const updateStatus = () => {
      const status = statuses[currentIndex];
      client.user.setActivity({
        name: status.name,
        type: status.type,
        url: status.type === ActivityType.Streaming ? 'https://twitch.tv/directory/game/Tiny%20Survivors' : null
      });
      
      logger.info(`Status updated: ${status.emoji} ${status.type} ${status.name}`);
      currentIndex = (currentIndex + 1) % statuses.length;
    };

    // Update immediately and every 60 seconds
    updateStatus();
    setInterval(updateStatus, 60000);
    
    // Display beautiful connection message
    console.log(`
✨ Bot is now online!
━━━━━━━━━━━━━━━━━━━━
🤖 Name: ${botName}
🏠 Servers: ${serverCount}
👥 Users: ${userCount}
🚀 Status: Ready for adventures!
━━━━━━━━━━━━━━━━━━━━
    `);
  }
};