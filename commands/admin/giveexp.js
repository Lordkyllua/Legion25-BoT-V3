const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { addExperience } = require('../../utils/rpg');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveexp')
        .setDescription('Give experience to a user (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to give experience to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of experience to give')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100000)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        try {
            const user = await User.findById(targetUser.id);
            if (!user || !user.rpg) {
                return await interaction.reply({ 
                    content: 'This user does not have a character! They need to use `/rpg` first.', 
                    ephemeral: true 
                });
            }

            const oldLevel = user.rpg.level;
            const oldExp = user.rpg.exp;
            const oldMaxExp = user.rpg.maxExp;

            const result = await addExperience(targetUser.id, amount);

            const embed = new EmbedBuilder()
                .setTitle('⭐ Experience Given')
                .setColor(0x3498DB)
                .addFields(
                    { name: '👤 Recipient', value: `${targetUser} (${targetUser.tag})`, inline: true },
                    { name: '🎁 Amount Given', value: `⭐ ${amount} EXP`, inline: true },
                    { name: '📊 Before', value: `Level ${oldLevel} | ${oldExp}/${oldMaxExp} EXP`, inline: true },
                    { name: '📈 After', value: `Level ${result.user.level} | ${result.user.exp}/${result.user.maxExp} EXP`, inline: true },
                    { name: '👤 Given By', value: `${interaction.user}`, inline: true }
                )
                .setTimestamp();

            if (result.levelsGained > 0) {
                embed.addFields({
                    name: '🎊 Level Up!',
                    value: `🎉 ${targetUser.username} gained ${result.levelsGained} level(s)!`,
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });

            // Notificar al usuario
            try {
                let message = `🎉 You received ⭐ **${amount} experience** from an administrator!\n`;
                message += `Your new level: **${result.user.level}** (${result.user.exp}/${result.user.maxExp} EXP)`;
                
                if (result.levelsGained > 0) {
                    message += `\n\n🎊 **You leveled up ${result.levelsGained} time(s)!**`;
                }

                await targetUser.send({ content: message });
            } catch (error) {
                console.log('Could not send DM to user');
            }

        } catch (error) {
            console.error('Error giving experience:', error);
            await interaction.reply({ 
                content: 'There was an error giving experience to the user.', 
                ephemeral: true 
            });
        }
    },
};