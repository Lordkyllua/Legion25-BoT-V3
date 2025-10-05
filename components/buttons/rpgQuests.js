const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'rpg_quests',
    
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        
        if (!user) {
            return await interaction.reply({ 
                content: '❌ You need to start your RPG journey first!', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('📜 Quest Journal')
            .setColor(0xF39C12)
            .addFields(
                { name: '🎯 Active Quest', value: user.activeQuest || 'None', inline: true },
                { name: '📊 Progress', value: user.questProgress ? `${user.questProgress}%` : '0%', inline: true },
                { name: '📅 Daily Quests', value: `${user.dailyQuests}/3 completed`, inline: true },
                { name: '🏆 Achievements', value: `Monsters: ${user.monstersDefeated}\nBosses: ${user.bossesDefeated}`, inline: false }
            )
            .setFooter({ text: 'Use /quest to start a new quest' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};