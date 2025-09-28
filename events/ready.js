module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ Logged in as ${client.user.tag}!`);
        console.log(`🎮 Bot is ready with ${client.commands.size} commands`);
        console.log(`👥 Serving ${client.guilds.cache.size} servers`);
        
        // Set bot status
        client.user.setActivity('Micro Hunter | /help', { type: 'PLAYING' });
    },
};