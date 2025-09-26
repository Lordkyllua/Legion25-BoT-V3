const fs = require('fs');
const path = require('path');
const database = require('./database');

class Migrator {
    async migrateFromJSON() {
        try {
            const oldFiles = ['database.json', 'points.json'];
            let migratedCount = 0;

            for (const file of oldFiles) {
                const filePath = path.join(__dirname, '../', file);
                if (fs.existsSync(filePath)) {
                    await this.migrateFile(file, filePath);
                    migratedCount++;
                }
            }

            if (migratedCount > 0) {
                console.log(`✅ Migrated ${migratedCount} files to new database system`);
            }
        } catch (error) {
            console.error('❌ Migration failed:', error);
        }
    }

    async migrateFile(fileName, filePath) {
        try {
            const oldData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            switch (fileName) {
                case 'database.json':
                    await this.migrateDatabase(oldData);
                    break;
                case 'points.json':
                    await this.migratePoints(oldData);
                    break;
            }
            
            // Crear backup del archivo viejo
            const backupPath = filePath + '.backup';
            fs.copyFileSync(filePath, backupPath);
            
            console.log(`✅ Migrated ${fileName}`);
        } catch (error) {
            console.error(`❌ Error migrating ${fileName}:`, error);
        }
    }

    async migrateDatabase(oldData) {
        if (oldData.users) {
            for (const [userId, userData] of Object.entries(oldData.users)) {
                if (userData.rpg) {
                    database.updateRPGProfile(userId, userData.rpg);
                }
            }
        }
    }

    async migratePoints(oldData) {
        for (const [userId, points] of Object.entries(oldData)) {
            const user = database.getUser(userId);
            user.points = points;
            database.updateUser(userId, user);
        }
    }
}

module.exports = new Migrator();