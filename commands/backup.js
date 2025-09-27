const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const backupSystem = require('../utils/backup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription('Manage bot data backups (Admin only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new backup of all data'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all available backups'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('restore')
                .setDescription('Restore data from a backup')
                .addStringOption(option =>
                    option.setName('backup_id')
                        .setDescription('The backup ID to restore from')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a backup')
                .addStringOption(option =>
                    option.setName('backup_id')
                        .setDescription('The backup ID to delete')
                        .setRequired(true))),
    
    async execute(interaction) {
        // Verificar permisos de administrador
        if (!interaction.member.permissions.has('Administrator')) {
            return await interaction.reply({
                content: '❌ You need administrator permissions to use backup commands.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'create':
                    await this.createBackup(interaction);
                    break;
                case 'list':
                    await this.listBackups(interaction);
                    break;
                case 'restore':
                    await this.restoreBackup(interaction);
                    break;
                case 'delete':
                    await this.deleteBackup(interaction);
                    break;
            }
        } catch (error) {
            console.error('Backup command error:', error);
            await interaction.reply({
                content: '❌ Error executing backup command.',
                ephemeral: true
            });
        }
    },

    async createBackup(interaction) {
        await interaction.deferReply();
        
        const result = backupSystem.createBackup();
        
        if (result.success) {
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Backup Created Successfully')
                .addFields(
                    { name: '📁 Backup ID', value: result.backupId, inline: true },
                    { name: '📊 Files Backed Up', value: result.files.join(', '), inline: true },
                    { name: '💾 Location', value: `./backups/${result.backupId}`, inline: false }
                )
                .setFooter({ text: 'Backup system • Developed by LordK' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply({
                content: `❌ Backup creation failed: ${result.error}`
            });
        }
    },

    async listBackups(interaction) {
        await interaction.deferReply();
        
        const result = backupSystem.listBackups();
        
        if (result.success) {
            if (result.backups.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xffa500)
                    .setTitle('📋 Available Backups')
                    .setDescription('No backups found. Create one with `/backup create`')
                    .setFooter({ text: 'Backup system • Developed by LordK' });

                return await interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('📋 Available Backups')
                .setDescription(`Found ${result.backups.length} backup(s)`);
            
            result.backups.forEach((backup, index) => {
                const date = new Date(backup.timestamp).toLocaleString();
                embed.addFields({
                    name: `#${index + 1} - ${backup.id}`,
                    value: `**Date:** ${date}\n**Files:** ${backup.files ? backup.files.join(', ') : 'Unknown'}`,
                    inline: false
                });
            });

            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply({
                content: `❌ Error listing backups: ${result.error}`
            });
        }
    },

    async restoreBackup(interaction) {
        await interaction.deferReply();
        
        const backupId = interaction.options.getString('backup_id');
        const result = backupSystem.restoreBackup(backupId);
        
        if (result.success) {
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Backup Restored Successfully')
                .addFields(
                    { name: '📁 Backup ID', value: backupId, inline: true },
                    { name: '📊 Files Restored', value: result.filesRestored.join(', '), inline: true },
                    { name: '⚠️ Important', value: 'Bot data has been restored. Some features may need restart.', inline: false }
                )
                .setFooter({ text: 'Backup system • Developed by LordK' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply({
                content: `❌ Backup restoration failed: ${result.error}`
            });
        }
    },

    async deleteBackup(interaction) {
        await interaction.deferReply();
        
        const backupId = interaction.options.getString('backup_id');
        const result = backupSystem.deleteBackup(backupId);
        
        if (result.success) {
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Backup Deleted Successfully')
                .addFields(
                    { name: '📁 Backup ID', value: backupId, inline: true },
                    { name: '🗑️ Status', value: 'Backup has been permanently deleted', inline: true }
                )
                .setFooter({ text: 'Backup system • Developed by LordK' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply({
                content: `❌ Backup deletion failed: ${result.error}`
            });
        }
    }
};