const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

class BackupSystem {
    constructor() {
        this.backupDir = './backups';
        this.ensureBackupDir();
    }

    ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    // Crear backup de todos los datos
    createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupId = `backup-${timestamp}`;
            const backupPath = path.join(this.backupDir, backupId);
            
            // Crear directorio para este backup
            fs.mkdirSync(backupPath);
            
            // Archivos a respaldar
            const filesToBackup = [
                'database.json',
                'points.json', 
                'store.json',
                'utils/rolesConfig.json'
            ];
            
            const backupInfo = {
                id: backupId,
                timestamp: new Date().toISOString(),
                files: []
            };
            
            // Copiar cada archivo
            filesToBackup.forEach(file => {
                if (fs.existsSync(file)) {
                    const backupFile = path.join(backupPath, path.basename(file));
                    fs.copyFileSync(file, backupFile);
                    backupInfo.files.push(path.basename(file));
                }
            });
            
            // Guardar información del backup
            const infoFile = path.join(backupPath, 'backup-info.json');
            fs.writeFileSync(infoFile, JSON.stringify(backupInfo, null, 2));
            
            return { success: true, backupId, files: backupInfo.files };
            
        } catch (error) {
            console.error('Backup creation error:', error);
            return { success: false, error: error.message };
        }
    }

    // Listar backups disponibles
    listBackups() {
        try {
            if (!fs.existsSync(this.backupDir)) {
                return { success: true, backups: [] };
            }
            
            const backups = fs.readdirSync(this.backupDir)
                .filter(dir => dir.startsWith('backup-'))
                .map(dir => {
                    const infoPath = path.join(this.backupDir, dir, 'backup-info.json');
                    if (fs.existsSync(infoPath)) {
                        const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
                        return info;
                    }
                    return { id: dir, timestamp: dir.replace('backup-', '') };
                })
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            return { success: true, backups };
            
        } catch (error) {
            console.error('Backup list error:', error);
            return { success: false, error: error.message };
        }
    }

    // Restaurar desde backup
    restoreBackup(backupId) {
        try {
            const backupPath = path.join(this.backupDir, backupId);
            
            if (!fs.existsSync(backupPath)) {
                return { success: false, error: 'Backup not found' };
            }
            
            // Verificar archivos disponibles
            const files = fs.readdirSync(backupPath)
                .filter(file => file !== 'backup-info.json');
            
            // Restaurar cada archivo
            files.forEach(file => {
                const sourcePath = path.join(backupPath, file);
                const targetPath = `./${file}`;
                
                // Crear directorio de destino si no existe
                const targetDir = path.dirname(targetPath);
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                
                fs.copyFileSync(sourcePath, targetPath);
            });
            
            return { success: true, filesRestored: files };
            
        } catch (error) {
            console.error('Backup restore error:', error);
            return { success: false, error: error.message };
        }
    }

    // Eliminar backup
    deleteBackup(backupId) {
        try {
            const backupPath = path.join(this.backupDir, backupId);
            
            if (!fs.existsSync(backupPath)) {
                return { success: false, error: 'Backup not found' };
            }
            
            // Eliminar directorio recursivamente
            fs.rmSync(backupPath, { recursive: true, force: true });
            
            return { success: true };
            
        } catch (error) {
            console.error('Backup delete error:', error);
            return { success: false, error: error.message };
        }
    }

    // Backup automático programado
    startAutoBackup(intervalHours = 24) {
        setInterval(() => {
            const result = this.createBackup();
            if (result.success) {
                console.log(`✅ Auto-backup created: ${result.backupId}`);
            } else {
                console.error('❌ Auto-backup failed:', result.error);
            }
        }, intervalHours * 60 * 60 * 1000);
    }
}

module.exports = new BackupSystem();