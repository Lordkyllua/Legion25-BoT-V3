const database = require('../config/database');

class Warning {
    static collection() {
        return database.getCollection('warnings');
    }

    static async addWarning(userId, guildId, moderatorId, reason) {
        const warning = {
            userId,
            guildId,
            moderatorId,
            reason,
            timestamp: new Date(),
            active: true
        };

        await this.collection().insertOne(warning);
        return warning;
    }

    static async getUserWarnings(userId, guildId = null) {
        const query = { userId };
        if (guildId) {
            query.guildId = guildId;
        }

        return await this.collection()
            .find(query)
            .sort({ timestamp: -1 })
            .toArray();
    }

    static async getActiveWarnings(userId, guildId = null) {
        const query = { userId, active: true };
        if (guildId) {
            query.guildId = guildId;
        }

        return await this.collection()
            .find(query)
            .sort({ timestamp: -1 })
            .toArray();
    }

    static async removeWarning(warningId) {
        const result = await this.collection().findOneAndUpdate(
            { _id: warningId },
            { $set: { active: false } },
            { returnDocument: 'after' }
        );
        return result;
    }

    static async clearUserWarnings(userId, guildId = null) {
        const query = { userId };
        if (guildId) {
            query.guildId = guildId;
        }

        const result = await this.collection().updateMany(
            query,
            { $set: { active: false } }
        );
        return result.modifiedCount;
    }

    static async getWarningCount(userId, guildId = null) {
        const query = { userId, active: true };
        if (guildId) {
            query.guildId = guildId;
        }

        return await this.collection().countDocuments(query);
    }
}

module.exports = Warning;