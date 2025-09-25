const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        const logger = client.logger;
        
        const botName = client.user.tag;
        const serverCount = client.guilds.cache.size;
        const userCount = client.users.cache.size;
        
        logger.success(`Logged in as ${botName}`);
        logger.info(`Serving ${serverCount} servers and ${userCount} users`);
        
        // Status rotation with correct reference
        const statuses = [
            { name: 'Tiny Survivors by Micro Hunter', type: ActivityType.Playing, emoji: '🎮' },
            { name: 'survival adventures', type: ActivityType.Playing, emoji: '⚔️' },
            { name: 'with class evolutions', type: ActivityType.Competing, emoji: '🛡️' },
            { name: 'the item shop', type: ActivityType.Watching, emoji: '🛍️' },
            { name: `${serverCount} servers`, type: ActivityType.Watching, emoji: '🌐' },
            { name: '/help for commands', type: ActivityType.Listening, emoji: '📖' },
            { name: 'RPG quests', type: ActivityType.Playing, emoji: '🏹' }
        ];

        let currentIndex = 0;
        
        const updateStatus = () => {
            const status = statuses[currentIndex];
            client.user.setActivity({
                name: status.name,
                type: status.type
            });
            
            logger.info(`Status updated: ${status.emoji} ${status.type} ${status.name}`);
            currentIndex = (currentIndex + 1) % statuses.length;
        };

        updateStatus();
        setInterval(updateStatus, 60000);
        
        console.log(`
✨ Bot is now online!
━━━━━━━━━━━━━━━━━━━━
🤖 Name: ${botName}
🏠 Servers: ${serverCount}
👥 Users: ${userCount}
🎮 Inspired by: Tiny Survivors (Micro Hunter)
🚀 Status: Ready for survival adventures!
━━━━━━━━━━━━━━━━━━━━
        `);
    }
};