const { MongoClient } = require('mongodb');
require('colors');

class Database {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            const mongoUri = process.env.MONGODB_URI;
            
            if (!mongoUri) {
                throw new Error('MONGODB_URI environment variable is not set');
            }

            console.log('🔄 Connecting to MongoDB...'.yellow);
            
            this.client = new MongoClient(mongoUri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            await this.client.connect();
            this.db = this.client.db('legion25_bot');
            this.isConnected = true;

            console.log('✅ MongoDB connected successfully!'.green);
            
            // Create indexes for better performance
            await this.createIndexes();
            
            return this.db;
        } catch (error) {
            console.error('❌ MongoDB connection failed:'.red, error.message);
            throw error;
        }
    }

    async createIndexes() {
        try {
            // Users collection indexes
            await this.db.collection('users').createIndex({ userId: 1 }, { unique: true });
            await this.db.collection('users').createIndex({ 'rpg.class': 1 });
            await this.db.collection('users').createIndex({ 'rpg.level': -1 });
            
            // Gold collection indexes
            await this.db.collection('gold').createIndex({ userId: 1 }, { unique: true });
            await this.db.collection('gold').createIndex({ amount: -1 });
            
            // Warnings collection indexes
            await this.db.collection('warnings').createIndex({ userId: 1 });
            await this.db.collection('warnings').createIndex({ guildId: 1 });
            
            console.log('✅ Database indexes created successfully!'.green);
        } catch (error) {
            console.error('❌ Error creating indexes:'.red, error.message);
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            console.log('🔌 MongoDB disconnected'.yellow);
        }
    }

    getCollection(collectionName) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }
        return this.db.collection(collectionName);
    }
}

module.exports = new Database();