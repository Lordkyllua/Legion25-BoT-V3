const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with Micro Hunter RPG commands'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 Micro Hunter RPG - Help')
            .setDescription('A powerful RPG bot inspired by Micro Hunter\n**Developed by LordK**')
            .setColor(0x00AE86)
            .addFields(
                {
                    name: '🎯 RPG Commands',
                    value: '`/rpg start` - Start your RPG journey\n`/rpg profile` - Check your profile\n`/rpg class` - Choose your class\n`/quest` - Start a quest\n`/fight` - Battle monsters'
                },
                {
                    name: '🛒 Economy Commands',
                    value: '`/shop` - Browse the item shop\n`/buy` - Purchase items\n`/inventory` - Check your inventory\n`/coinflip` - Gamble your gold'
                },
                {
                    name: '📊 Social Commands',
                    value: '`/ranking` - View leaderboards\n`/roles` - Manage your roles'
                },
                {
                    name: '⚙️ Admin Commands',
                    value: '`/givegold` - Give gold to users\n`/giveexp` - Give experience\n`/roleadmin` - Manage server roles\n`/warn` - Warn users\n`/warnings` - Check warnings\n`/mute` - Mute users'
                }
            )
            .setFooter({ text: 'Micro Hunter RPG - Developed by LordK', iconURL: interaction.client.user.displayAvatarURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_rpg')
                    .setLabel('RPG Guide')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_economy')
                    .setLabel('Economy Guide')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('help_classes')
                    .setLabel('Classes Info')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};