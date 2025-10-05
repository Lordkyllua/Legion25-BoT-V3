const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'start_quest',
    
    async execute(interaction) {
        // Extraer el nombre de la quest del customId (puede ser start_quest_QuestName)
        const questName = interaction.customId.includes('_') 
            ? interaction.customId.split('_').slice(2).join('_')
            : 'Unknown Quest';
            
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });

        if (!user) {
            return await interaction.reply({ 
                content: '❌ User not found!', 
                ephemeral: true 
            });
        }

        user.activeQuest = questName;
        user.questProgress = 0;
        user.cooldowns = user.cooldowns || {};
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