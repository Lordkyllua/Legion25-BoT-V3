const database = require('../config/database');

class Shop {
    static collection() {
        return database.getCollection('shop');
    }

    static async getAllItems() {
        return await this.collection().find().toArray();
    }

    static async getItemById(itemId) {
        return await this.collection().findOne({ id: itemId });
    }

    static async getItemsByCategory(category) {
        return await this.collection().find({ type: category }).toArray();
    }

    static async getItemsByClass(itemClass) {
        return await this.collection().find({ class: itemClass }).toArray();
    }

    static async getItemsByLevel(maxLevel) {
        return await this.collection().find({ level: { $lte: maxLevel } }).toArray();
    }

    static async addItem(itemData) {
        // Generate unique ID if not provided
        if (!itemData.id) {
            const lastItem = await this.collection()
                .find()
                .sort({ id: -1 })
                .limit(1)
                .toArray();
            itemData.id = lastItem.length > 0 ? lastItem[0].id + 1 : 1;
        }

        await this.collection().insertOne({
            ...itemData,
            createdAt: new Date(),
            available: true
        });

        return itemData;
    }

    static async updateItem(itemId, updateData) {
        const result = await this.collection().findOneAndUpdate(
            { id: itemId },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        return result;
    }

    static async removeItem(itemId) {
        const result = await this.collection().findOneAndDelete({ id: itemId });
        return result;
    }

    static async getCategories() {
        return await this.collection().distinct('type');
    }

    static async initializeDefaultItems() {
        const defaultItems = [
            {
                id: 1,
                name: "🔪 Basic Sword",
                description: "A simple sword for beginner warriors",
                price: 100,
                type: "weapon",
                class: "warrior",
                level: 1,
                stats: { attack: 5, defense: 1 },
                rarity: "common"
            },
            {
                id: 2,
                name: "🏹 Wooden Bow",
                description: "A basic bow for novice archers",
                price: 100,
                type: "weapon",
                class: "archer",
                level: 1,
                stats: { attack: 4, agility: 2 },
                rarity: "common"
            },
            {
                id: 3,
                name: "🔮 Apprentice Staff",
                description: "A staff for young mages",
                price: 100,
                type: "weapon",
                class: "mage",
                level: 1,
                stats: { magic: 6, intelligence: 2 },
                rarity: "common"
            },
            {
                id: 4,
                name: "🛡️ Iron Armor",
                description: "Basic protection for warriors",
                price: 150,
                type: "armor",
                class: "warrior",
                level: 5,
                stats: { defense: 8, hp: 20 },
                rarity: "common"
            },
            {
                id: 5,
                name: "🧥 Leather Armor",
                description: "Light armor for agile archers",
                price: 120,
                type: "armor",
                class: "archer",
                level: 5,
                stats: { defense: 5, agility: 5 },
                rarity: "common"
            },
            {
                id: 6,
                name: "👘 Mage Robe",
                description: "Enchanted robe for spellcasters",
                price: 130,
                type: "armor",
                class: "mage",
                level: 5,
                stats: { defense: 3, magic: 8 },
                rarity: "common"
            },
            {
                id: 7,
                name: "❤️ Health Potion",
                description: "Restores 50 HP in battle",
                price: 50,
                type: "potion",
                class: "all",
                level: 1,
                stats: { hp: 50 },
                rarity: "common"
            },
            {
                id: 8,
                name: "💙 Mana Potion",
                description: "Restores 30 MP for spells",
                price: 60,
                type: "potion",
                class: "all",
                level: 1,
                stats: { mp: 30 },
                rarity: "common"
            },
            {
                id: 9,
                name: "⚔️ Dragon Slayer",
                description: "Legendary sword for master warriors",
                price: 500,
                type: "weapon",
                class: "warrior",
                level: 20,
                stats: { attack: 25, defense: 5 },
                rarity: "epic"
            },
            {
                id: 10,
                name: "🎯 Elven Bow",
                description: "Mystical bow with perfect accuracy",
                price: 450,
                type: "weapon",
                class: "archer",
                level: 20,
                stats: { attack: 20, agility: 15 },
                rarity: "epic"
            }
        ];

        const existingItems = await this.collection().countDocuments();
        if (existingItems === 0) {
            await this.collection().insertMany(defaultItems);
            console.log('✅ Default shop items initialized!'.green);
        }
    }
}

module.exports = Shop;