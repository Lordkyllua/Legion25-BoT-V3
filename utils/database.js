const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.data = {};
        this.filePath = path.join(__dirname, '../database.json');
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(this.filePath)) {
                const fileData = fs.readFileSync(this.filePath, 'utf8');
                this.data = JSON.parse(fileData);
                console.log('✅ Database loaded successfully');
            } else {
                this.data = { users: {}, clans: {}, warnings: {} };
                this.save();
                console.log('✅ New database created');
            }
        } catch (error) {
            console.error('❌ Error loading database:', error);
            this.data = { users: {}, clans: {}, warnings: {} };
        }
    }

    save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
            return true;
        } catch (error) {
            console.error('❌ Error saving database:', error);
            return false;
        }
    }

    // User methods
    getUser(userId) {
        if (!this.data.users[userId]) {
            this.data.users[userId] = this.createDefaultUser();
        }
        return this.data.users[userId];
    }

    updateUser(userId, userData) {
        this.data.users[userId] = { ...this.getUser(userId), ...userData };
        return this.save();
    }

    // RPG methods
    getRPGProfile(userId) {
        const user = this.getUser(userId);
        if (!user.rpg) {
            user.rpg = this.createDefaultRPGProfile();
            this.save();
        }
        return user.rpg;
    }

    updateRPGProfile(userId, rpgData) {
        const user = this.getUser(userId);
        user.rpg = { ...user.rpg, ...rpgData };
        return this.save();
    }

    // Clan methods
    getClan(clanId) {
        return this.data.clans[clanId] || null;
    }

    createClan(clanId, clanData) {
        this.data.clans[clanId] = clanData;
        return this.save();
    }

    // Warning methods
    getWarnings(userId) {
        return this.data.warnings[userId] || [];
    }

    addWarning(userId, warningData) {
        if (!this.data.warnings[userId]) {
            this.data.warnings[userId] = [];
        }
        this.data.warnings[userId].push(warningData);
        return this.save();
    }

    // Utility methods
    createDefaultUser() {
        return {
            joinedAt: new Date().toISOString(),
            points: 0,
            rpg: this.createDefaultRPGProfile()
        };
    }

    createDefaultRPGProfile() {
        return {
            level: 1,
            exp: 0,
            expToNextLevel: 100,
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            gold: 50,
            class: null,
            className: "Apprentice",
            evolution: null,
            evolutionLevel: 0,
            skills: ['Basic Attack'],
            equipment: {
                weapon: 'None',
                armor: 'Basic Clothes',
                accessory: 'None'
            },
            stats: {
                attack: 10,
                defense: 5,
                magic: 5,
                agility: 10
            },
            inventory: [],
            achievements: [],
            lastDaily: null,
            dailyStreak: 0
        };
    }

    close() {
        this.save();
        console.log('✅ Database closed');
    }
}

module.exports = new Database();