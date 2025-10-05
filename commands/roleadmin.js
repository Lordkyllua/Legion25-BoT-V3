const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleadmin')
        .setDescription('Admin role management (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new role')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Role name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('Role color (hex)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a role')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to delete')
                        .setRequired(true))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            await handleCreateRole(interaction);
        } else if (subcommand === 'delete') {
            await handleDeleteRole(interaction);
        }
    }
};

async function handleCreateRole(interaction) {
    const name = interaction.options.getString('name');
    const color = interaction.options.getString('color') || '#99AAB5';

    try {
        const role = await interaction.guild.roles.create({
            name: name,
            color: color,
            reason: `Role created by ${interaction.user.tag}`
        });

        const embed = new EmbedBuilder()
            .setTitle('✅ Role Created')
            .setColor(0x2ECC71)
            .addFields(
                { name: '🎭 Role Name', value: role.name, inline: true },
                { name: '🎨 Color', value: color, inline: true },
                { name: '🆔 Role ID', value: role.id, inline: true }
            )
            .setFooter({ text: 'Use /roles to assign to users' });

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        await interaction.reply({ 
            content: '❌ Failed to create role. Check bot permissions.', 
            ephemeral: true 
        });
    }
}

async function handleDeleteRole(interaction) {
    const role = interaction.options.getRole('role');

    try {
        await role.delete(`Role deleted by ${interaction.user.tag}`);

        const embed = new EmbedBuilder()
            .setTitle('✅ Role Deleted')
            .setColor(0x2ECC71)
            .addFields(
                { name: '🎭 Role Name', value: role.name, inline: true },
                { name: '🆔 Role ID', value: role.id, inline: true }
            )
            .setFooter({ text: 'Role successfully deleted' });

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        await interaction.reply({ 
            content: '❌ Failed to delete role. Check bot permissions.', 
            ephemeral: true 
        });
    }
}