const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class BackupSystem {
    constructor() {
        this.backupDir = path.join(__dirname, '../backups');
        this.createBackupDir();
    }

    createBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(this.backupDir, `backup-${timestamp}.json`);
            
            const dataFiles = ['database.json', 'points.json', 'store.json'];
            const backupData = {};
            
            for (const file of dataFiles) {
                const filePath = path.join(__dirname, '../', file);
                if (fs.existsSync(filePath)) {
                    backupData[file] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                }
            }
            
            fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
            
            // Mantener solo los últimos 10 backups
            this.cleanOldBackups();
            
            console.log(`✅ Backup created: ${backupFile}`);
            return true;
        } catch (error) {
            console.error('❌ Backup failed:', error);
            return false;
        }
    }

    cleanOldBackups() {
        try {
            const files = fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
                .map(file => ({
                    name: file,
                    time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time);

            // Eliminar backups viejos (mantener solo 10 más recientes)
            if (files.length > 10) {
                for (let i = 10; i < files.length; i++) {
                    fs.unlinkSync(path.join(this.backupDir, files[i].name));
                }
            }
        } catch (error) {
            console.error('❌ Error cleaning old backups:', error);
        }
    }

    async restoreBackup(backupFile) {
        try {
            const backupPath = path.join(this.backupDir, backupFile);
            if (!fs.existsSync(backupPath)) {
                throw new Error('Backup file not found');
            }

            const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
            
            for (const [fileName, data] of Object.entries(backupData)) {
                const filePath = path.join(__dirname, '../', fileName);
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            }
            
            console.log(`✅ Backup restored: ${backupFile}`);
            return true;
        } catch (error) {
            console.error('❌ Restore failed:', error);
            return false;
        }
    }

    listBackups() {
        try {
            return fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
                .sort()
                .reverse();
        } catch (error) {
            console.error('❌ Error listing backups:', error);
            return [];
        }
    }
}

module.exports = new BackupSystem();