const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'start_quest',
    
    async execute(interaction) {
        const questName = interaction.customId.replace('start_quest_', '');
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });

        if (!user) return;

        user.activeQuest = questName;
        user.questProgress = 0;
        user.cooldowns.quest = new Date(Date.now() + 30 * 60 * 1000); // 30 min cooldown
        await user.save();

        const embed = new EmbedBuilder()
            .setTitle('🎯 Quest Started!')
            .setColor(0x2ECC71)
            .setDescription(`You have started: **${questName}**`)
            .addFields(
                { name: '⏱️ Duration', value: 'Quest will complete in 5-30 minutes', inline: true },
                { name: '📊 Progress', value: 'Check back later for completion!', inline: true }
            )
            .setFooter({ text: 'Use /quest again to check progress' });

        await interaction.update({ content: '✅ Quest started successfully!', embeds: [embed], components: [] });
    }
};