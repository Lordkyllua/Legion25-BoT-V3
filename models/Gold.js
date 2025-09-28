const database = require('../config/database');

class Gold {
    static collection() {
        return database.getCollection('gold');
    }

    static async getBalance(userId) {
        const record = await this.collection().findOne({ userId });
        return record ? record.amount : 0;
    }

    static async setBalance(userId, amount) {
        if (amount < 0) throw new Error('Gold amount cannot be negative');
        
        const result = await this.collection().findOneAndUpdate(
            { userId },
            { $set: { amount, lastUpdated: new Date() } },
            { upsert: true, returnDocument: 'after' }
        );
        return result.amount;
    }

    static async addGold(userId, amount) {
        if (amount <= 0) throw new Error('Gold amount must be positive');
        
        const result = await this.collection().findOneAndUpdate(
            { userId },
            { 
                $inc: { amount },
                $set: { lastUpdated: new Date() }
            },
            { upsert: true, returnDocument: 'after' }
        );
        return result.amount;
    }

    static async removeGold(userId, amount) {
        if (amount <= 0) throw new Error('Gold amount must be positive');
        
        const currentBalance = await this.getBalance(userId);
        if (currentBalance < amount) {
            throw new Error('Insufficient gold');
        }

        const result = await this.collection().findOneAndUpdate(
            { userId },
            { 
                $inc: { amount: -amount },
                $set: { lastUpdated: new Date() }
            },
            { returnDocument: 'after' }
        );
        return result.amount;
    }

    static async transferGold(fromUserId, toUserId, amount) {
        if (amount <= 0) throw new Error('Transfer amount must be positive');
        
        const session = database.client.startSession();
        
        try {
            session.startTransaction();
            
            const fromBalance = await this.getBalance(fromUserId);
            if (fromBalance < amount) {
                throw new Error('Insufficient gold for transfer');
            }

            // Remove gold from sender
            await this.collection().updateOne(
                { userId: fromUserId },
                { 
                    $inc: { amount: -amount },
                    $set: { lastUpdated: new Date() }
                },
                { session }
            );

            // Add gold to receiver
            await this.collection().updateOne(
                { userId: toUserId },
                { 
                    $inc: { amount },
                    $set: { lastUpdated: new Date() }
                },
                { upsert: true, session }
            );

            await session.commitTransaction();
            return true;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    static async getTopRich(limit = 10) {
        return await this.collection()
            .find({ amount: { $gt: 0 } })
            .sort({ amount: -1 })
            .limit(limit)
            .toArray();
    }

    static async getTotalGoldInCirculation() {
        const result = await this.collection().aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]).toArray();
        
        return result.length > 0 ? result[0].total : 0;
    }
}

module.exports = Gold;