module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const channel = member.guild.systemChannel;
        if (channel) {
            try {
                await channel.send(`Welcome to the server, ${member}! Use \`/help\` to see what I can do. 🎉`);
            } catch (error) {
                console.error('Could not send welcome message:', error);
            }
        }
    },
};