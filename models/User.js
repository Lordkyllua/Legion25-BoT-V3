const database = require('../config/database');

class User {
    static collection() {
        return database.getCollection('users');
    }

    static async findById(userId) {
        return await this.collection().findOne({ userId });
    }

    static async create(userId, userData = {}) {
        const defaultUser = {
            userId,
            username: '',
            rpg: {
                class: null,
                level: 1,
                exp: 0,
                maxExp: 100,
                hp: 0,
                maxHp: 0,
                mp: 0,
                maxMp: 0,
                attack: 0,
                defense: 0,
                magic: 0,
                agility: 0,
                evolution: 'Beginner',
                inventory: [],
                equipped: {
                    weapon: null,
                    armor: null,
                    accessory: null
                },
                skills: [],
                questsCompleted: 0,
                monstersDefeated: 0,
                createdAt: new Date()
            },
            preferences: {
                notifications: true,
                privateProfile: false
            },
            statistics: {
                totalPlayTime: 0,
                lastActive: new Date(),
                timesLoggedIn: 1
            }
        };

        const user = { ...defaultUser, ...userData };
        await this.collection().insertOne(user);
        return user;
    }

    static async update(userId, updateData) {
        const result = await this.collection().findOneAndUpdate(
            { userId },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        return result;
    }

    static async updateRPG(userId, rpgUpdate) {
        const result = await this.collection().findOneAndUpdate(
            { userId },
            { $set: { rpg: rpgUpdate } },
            { returnDocument: 'after' }
        );
        return result;
    }

    static async addToInventory(userId, item) {
        const result = await this.collection().findOneAndUpdate(
            { userId },
            { $push: { 'rpg.inventory': item } },
            { returnDocument: 'after' }
        );
        return result;
    }

    static async removeFromInventory(userId, itemId) {
        const result = await this.collection().findOneAndUpdate(
            { userId },
            { $pull: { 'rpg.inventory': { id: itemId } } },
            { returnDocument: 'after' }
        );
        return result;
    }

    static async incrementQuestsCompleted(userId) {
        const result = await this.collection().findOneAndUpdate(
            { userId },
            { $inc: { 'rpg.questsCompleted': 1 } },
            { returnDocument: 'after' }
        );
        return result;
    }

    static async incrementMonstersDefeated(userId, amount = 1) {
        const result = await this.collection().findOneAndUpdate(
            { userId },
            { $inc: { 'rpg.monstersDefeated': amount } },
            { returnDocument: 'after' }
        );
        return result;
    }

    static async getTopPlayers(limit = 10) {
        return await this.collection()
            .find({ 'rpg.level': { $gt: 0 } })
            .sort({ 'rpg.level': -1, 'rpg.exp': -1 })
            .limit(limit)
            .toArray();
    }

    static async getUserCount() {
        return await this.collection().countDocuments();
    }
}

module.exports = User;