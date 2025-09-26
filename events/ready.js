const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        const logger = client.logger;
        
        const botName = client.user.tag;
        const serverCount = client.guilds.cache.size;
        
        // Count active users from data
        const usersData = client.dataManager.getData('users.json') || {};
        const userCount = Object.keys(usersData).length;
        
        logger.success(`Logged in as ${botName}`);
        logger.info(`Serving ${serverCount} servers and ${userCount} users`);
        
        // Enhanced status rotation
        const statuses = [
            { name: 'Tiny Survivors - My Game', type: ActivityType.Playing, emoji: '🎮' },
            { name: `${userCount} adventurers`, type: ActivityType.Watching, emoji: '👥' },
            { name: 'survival adventures', type: ActivityType.Playing, emoji: '⚔️' },
            { name: 'with class evolutions', type: ActivityType.Competing, emoji: '🛡️' },
            { name: 'the item shop', type: ActivityType.Watching, emoji: '🛍️' },
            { name: `${serverCount} servers`, type: ActivityType.Watching, emoji: '🌐' },
            { name: '/help for commands', type: ActivityType.Listening, emoji: '📖' }
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

        // Update status immediately and every 60 seconds
        updateStatus();
        const statusInterval = setInterval(updateStatus, 60000);
        
        // Store interval for cleanup
        client.statusInterval = statusInterval;
        
        // Enhanced startup message with data stats
        const pointsData = client.dataManager.getData('points.json') || {};
        const totalPoints = Object.values(pointsData).reduce((sum, points) => sum + points, 0);
        
        console.log(`
✨ Bot is now online!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Name: ${botName}
🏠 Servers: ${serverCount}
👥 Registered Users: ${userCount}
💰 Total Points: ${totalPoints}
🎮 Developer: LordK
💾 Data System: Robust v2.0
🚀 Status: Ready for adventures!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
        
        // Periodic backup every hour
        client.backupInterval = setInterval(() => {
            client.dataManager.createBackup();
        }, 60 * 60 * 1000); // 1 hour
    }
};