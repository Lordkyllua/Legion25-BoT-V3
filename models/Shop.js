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

    static async resetShopItems() {
        try {
            // Eliminar todos los items existentes
            await this.collection().deleteMany({});
            console.log('🗑️  Old shop items cleared'.yellow);
            
            // Inicializar con los nuevos items
            await this.initializeDefaultItems();
            
            return true;
        } catch (error) {
            console.error('❌ Error resetting shop items:'.red, error);
            return false;
        }
    }

    static async initializeDefaultItems() {
        const defaultItems = [
            // ========== MAGE ITEMS ==========
            {
                id: 1,
                name: "🔮 Apprentice Staff",
                description: "A basic staff for novice mages",
                price: 100,
                type: "weapon",
                class: "mage",
                level: 1,
                stats: { magic: 6, intelligence: 2 },
                rarity: "common"
            },
            {
                id: 2,
                name: "📖 Spellbook of Fire",
                description: "Contains basic fire spells",
                price: 200,
                type: "weapon",
                class: "mage",
                level: 5,
                stats: { magic: 12, intelligence: 5 },
                rarity: "uncommon"
            },
            {
                id: 3,
                name: "🌀 Crystal Orb",
                description: "Mystical orb that enhances magical power",
                price: 350,
                type: "weapon",
                class: "mage",
                level: 15,
                stats: { magic: 20, intelligence: 10, mp: 30 },
                rarity: "rare"
            },
            {
                id: 4,
                name: "⚡ Storm Caller",
                description: "Staff that channels lightning energy",
                price: 600,
                type: "weapon",
                class: "mage",
                level: 25,
                stats: { magic: 35, intelligence: 15, agility: 5 },
                rarity: "epic"
            },
            {
                id: 5,
                name: "🌟 Archmage Staff",
                description: "Legendary staff of the archmages",
                price: 1000,
                type: "weapon",
                class: "mage",
                level: 40,
                stats: { magic: 50, intelligence: 25, maxMp: 100 },
                rarity: "legendary"
            },
            {
                id: 6,
                name: "👘 Mage Robe",
                description: "Basic robe for spellcasters",
                price: 150,
                type: "armor",
                class: "mage",
                level: 5,
                stats: { defense: 3, magic: 8, mp: 20 },
                rarity: "common"
            },
            {
                id: 7,
                name: "🌀 Enchanted Cloak",
                description: "Cloak that shimmers with magical energy",
                price: 400,
                type: "armor",
                class: "mage",
                level: 20,
                stats: { defense: 8, magic: 15, intelligence: 10 },
                rarity: "rare"
            },

            // ========== WARRIOR ITEMS ==========
            {
                id: 8,
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
                id: 9,
                name: "🛡️ Iron Sword",
                description: "Reliable iron sword for seasoned warriors",
                price: 250,
                type: "weapon",
                class: "warrior",
                level: 8,
                stats: { attack: 12, defense: 3 },
                rarity: "uncommon"
            },
            {
                id: 10,
                name: "⚔️ Battle Axe",
                description: "Heavy axe that deals massive damage",
                price: 450,
                type: "weapon",
                class: "warrior",
                level: 18,
                stats: { attack: 25, defense: 5, strength: 10 },
                rarity: "rare"
            },
            {
                id: 11,
                name: "🐉 Dragon Slayer",
                description: "Legendary sword that has slain dragons",
                price: 800,
                type: "weapon",
                class: "warrior",
                level: 30,
                stats: { attack: 40, defense: 10, hp: 50 },
                rarity: "epic"
            },
            {
                id: 12,
                name: "👑 King's Greatsword",
                description: "Massive sword fit for a king",
                price: 1200,
                type: "weapon",
                class: "warrior",
                level: 45,
                stats: { attack: 60, defense: 15, strength: 20 },
                rarity: "legendary"
            },
            {
                id: 13,
                name: "🛡️ Iron Armor",
                description: "Basic protection for warriors",
                price: 200,
                type: "armor",
                class: "warrior",
                level: 5,
                stats: { defense: 8, hp: 20 },
                rarity: "common"
            },
            {
                id: 14,
                name: "⚜️ Plate Armor",
                description: "Heavy plate armor for maximum protection",
                price: 500,
                type: "armor",
                class: "warrior",
                level: 22,
                stats: { defense: 20, hp: 50, strength: 8 },
                rarity: "rare"
            },

            // ========== ARCHER ITEMS ==========
            {
                id: 15,
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
                id: 16,
                name: "🎯 Hunter's Bow",
                description: "Well-crafted bow for experienced hunters",
                price: 280,
                type: "weapon",
                class: "archer",
                level: 10,
                stats: { attack: 15, agility: 8 },
                rarity: "uncommon"
            },
            {
                id: 17,
                name: "🌙 Moonlight Bow",
                description: "Bow that glows with lunar energy",
                price: 550,
                type: "weapon",
                class: "archer",
                level: 20,
                stats: { attack: 28, agility: 15, dexterity: 10 },
                rarity: "rare"
            },
            {
                id: 18,
                name: "🎯 Elven Bow",
                description: "Mystical bow with perfect accuracy",
                price: 900,
                type: "weapon",
                class: "archer",
                level: 35,
                stats: { attack: 45, agility: 25, critical: 15 },
                rarity: "epic"
            },
            {
                id: 19,
                name: "🌠 Starfall Bow",
                description: "Bow that shoots arrows like falling stars",
                price: 1300,
                type: "weapon",
                class: "archer",
                level: 50,
                stats: { attack: 65, agility: 30, dexterity: 20 },
                rarity: "legendary"
            },
            {
                id: 20,
                name: "🧥 Leather Armor",
                description: "Light armor for agile archers",
                price: 180,
                type: "armor",
                class: "archer",
                level: 5,
                stats: { defense: 5, agility: 5 },
                rarity: "common"
            },
            {
                id: 21,
                name: "🌲 Ranger's Cloak",
                description: "Camouflage cloak for stealthy movement",
                price: 420,
                type: "armor",
                class: "archer",
                level: 18,
                stats: { defense: 12, agility: 15, stealth: 10 },
                rarity: "rare"
            },

            // ========== ACCESSORIES ==========
            {
                id: 22,
                name: "💍 Ring of Power",
                description: "Increases all stats slightly",
                price: 300,
                type: "accessory",
                class: "all",
                level: 10,
                stats: { attack: 3, defense: 3, magic: 3, agility: 3 },
                rarity: "uncommon"
            },
            {
                id: 23,
                name: "📿 Amulet of Health",
                description: "Greatly increases maximum HP",
                price: 400,
                type: "accessory",
                class: "all",
                level: 15,
                stats: { hp: 100, defense: 5 },
                rarity: "rare"
            },
            {
                id: 24,
                name: "👑 Crown of Wisdom",
                description: "Boosts magical abilities",
                price: 600,
                type: "accessory",
                class: "mage",
                level: 25,
                stats: { magic: 20, intelligence: 15, maxMp: 50 },
                rarity: "epic"
            },
            {
                id: 25,
                name: "🥾 Boots of Speed",
                description: "Makes you incredibly fast",
                price: 550,
                type: "accessory",
                class: "archer",
                level: 20,
                stats: { agility: 25, speed: 15 },
                rarity: "rare"
            },

            // ========== POTIONS & CONSUMABLES ==========
            {
                id: 26,
                name: "❤️ Health Potion",
                description: "Restores 50 HP",
                price: 50,
                type: "potion",
                class: "all",
                level: 1,
                stats: { hp: 50 },
                rarity: "common"
            },
            {
                id: 27,
                name: "💙 Mana Potion",
                description: "Restores 30 MP",
                price: 60,
                type: "potion",
                class: "all",
                level: 1,
                stats: { mp: 30 },
                rarity: "common"
            },
            {
                id: 28,
                name: "💜 Greater Health Potion",
                description: "Restores 150 HP",
                price: 120,
                type: "potion",
                class: "all",
                level: 10,
                stats: { hp: 150 },
                rarity: "uncommon"
            },
            {
                id: 29,
                name: "🖤 Elixir of Strength",
                description: "Temporarily increases attack power",
                price: 200,
                type: "consumable",
                class: "all",
                level: 15,
                stats: { attack: 10 },
                rarity: "rare"
            },
            {
                id: 30,
                name: "💚 Potion of Invisibility",
                description: "Makes you invisible for a short time",
                price: 350,
                type: "consumable",
                class: "all",
                level: 20,
                stats: { stealth: 999 },
                rarity: "epic"
            },
            {
                id: 31,
                name: "🧪 Super Health Potion",
                description: "Fully restores HP",
                price: 500,
                type: "potion",
                class: "all",
                level: 30,
                stats: { hp: 999 },
                rarity: "legendary"
            }
        ];

        const existingItems = await this.collection().countDocuments();
        if (existingItems === 0) {
            await this.collection().insertMany(defaultItems);
            console.log('✅ Default shop items initialized!'.green);
            console.log(`📦 Loaded ${defaultItems.length} items total`.blue);
            console.log(`🔮 Mage items: ${defaultItems.filter(i => i.class === 'mage').length}`.magenta);
            console.log(`⚔️ Warrior items: ${defaultItems.filter(i => i.class === 'warrior').length}`.red);
            console.log(`🏹 Archer items: ${defaultItems.filter(i => i.class === 'archer').length}`.green);
            console.log(`🎯 All-class items: ${defaultItems.filter(i => i.class === 'all').length}`.cyan);
        } else {
            console.log('✅ Shop items already exist'.green);
        }
    }
}

module.exports = Shop;