const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset player data (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('player')
                .setDescription('Reset player data')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to reset')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Reset type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Class Only', value: 'class' },
                            { name: 'Level Only', value: 'level' },
                            { name: 'Full Reset', value: 'full' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('shop')
                .setDescription('Reset and update shop items (Admin only)')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'player') {
            await handlePlayerReset(interaction);
        } else if (subcommand === 'shop') {
            await handleShopReset(interaction);
        }
    }
};

async function handlePlayerReset(interaction) {
    const targetUser = interaction.options.getUser('user');
    const resetType = interaction.options.getString('type');

    const user = await User.findOne({ userId: targetUser.id, guildId: interaction.guild.id });
    
    if (!user) {
        return await interaction.reply({ 
            content: '❌ That user has not started their RPG journey!', 
            ephemeral: true 
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('🔄 Player Reset')
        .setColor(0xE67E22);

    switch (resetType) {
        case 'class':
            user.class = 'Novice';
            user.evolution = 0;
            user.strength = 5;
            user.intelligence = 5;
            user.agility = 5;
            user.defense = 5;
            user.maxHealth = 100;
            user.health = 100;
            user.maxMana = 50;
            user.mana = 50;
            embed.setDescription(`🔄 Reset class for **${targetUser.username}**`);
            break;

        case 'level':
            user.level = 1;
            user.exp = 0;
            embed.setDescription(`📊 Reset level for **${targetUser.username}** to 1`);
            break;

        case 'full':
            await User.deleteOne({ userId: targetUser.id, guildId: interaction.guild.id });
            embed.setDescription(`💥 Full reset for **${targetUser.username}** - All data deleted`);
            break;
    }

    if (resetType !== 'full') {
        await user.save();
    }

    embed.addFields(
        { name: '👤 Player', value: targetUser.username, inline: true },
        { name: '🛠️ Reset Type', value: resetType.toUpperCase(), inline: true },
        { name: '🛡️ Moderator', value: interaction.user.username, inline: true }
    );

    await interaction.reply({ embeds: [embed] });
}

async function handleShopReset(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🛒 Shop Reset')
        .setDescription('Choose how to reset the shop items')
        .setColor(0xF1C40F)
        .addFields(
            {
                name: '🔄 Reset Options',
                value: '**Default Items** - Restore basic shop items\n**Advanced Items** - Add high-level items\n**Clear All** - Remove all items'
            }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('reset_shop_default')
                .setLabel('Default Items')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('reset_shop_advanced')
                .setLabel('Advanced Items')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('reset_shop_clear')
                .setLabel('Clear All')
                .setStyle(ButtonStyle.Danger)
        );

    await interaction.reply({ embeds: [embed], components: [row] });
}