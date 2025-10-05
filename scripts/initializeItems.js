const mongoose = require('mongoose');
require('dotenv').config();
const Item = require('../models/Item');

const initialItems = [
    // Weapons - Common
    {
        itemId: 'wooden_sword',
        name: 'Wooden Sword',
        description: 'A basic sword for beginners',
        type: 'weapon',
        rarity: 'common',
        levelRequirement: 1,
        price: 50,
        damage: 5,
        strength: 2,
        sellPrice: 10
    },
    {
        itemId: 'apprentice_staff',
        name: 'Apprentice Staff',
        description: 'Basic staff for novice mages',
        type: 'weapon',
        rarity: 'common',
        levelRequirement: 1,
        price: 45,
        damage: 4,
        intelligence: 3,
        sellPrice: 9
    },
    {
        itemId: 'hunting_bow',
        name: 'Hunting Bow',
        description: 'Simple bow for archery practice',
        type: 'weapon',
        rarity: 'common',
        levelRequirement: 1,
        price: 48,
        damage: 6,
        agility: 3,
        sellPrice: 9
    },
    
    // Armor - Common
    {
        itemId: 'leather_armor',
        name: 'Leather Armor',
        description: 'Basic protective leather armor',
        type: 'armor',
        rarity: 'common',
        levelRequirement: 1,
        price: 60,
        defense: 5,
        health: 10,
        sellPrice: 12
    },
    {
        itemId: 'cloth_robe',
        name: 'Cloth Robe',
        description: 'Simple robe for mages',
        type: 'armor',
        rarity: 'common',
        levelRequirement: 1,
        price: 55,
        defense: 3,
        intelligence: 4,
        mana: 10,
        sellPrice: 11
    },
    
    // Potions - Consumables
    {
        itemId: 'health_potion',
        name: 'Health Potion',
        description: 'Restores 50 health points',
        type: 'potion',
        rarity: 'common',
        levelRequirement: 1,
        price: 25,
        health: 50,
        consumable: true,
        stackable: true,
        sellPrice: 5
    },
    {
        itemId: 'mana_potion',
        name: 'Mana Potion',
        description: 'Restores 30 mana points',
        type: 'potion',
        rarity: 'common',
        levelRequirement: 1,
        price: 20,
        mana: 30,
        consumable: true,
        stackable: true,
        sellPrice: 4
    },
    
    // Accessories
    {
        itemId: 'copper_ring',
        name: 'Copper Ring',
        description: 'Basic ring that provides slight protection',
        type: 'accessory',
        rarity: 'common',
        levelRequirement: 5,
        price: 75,
        defense: 2,
        health: 5,
        sellPrice: 15
    }
];

async function initializeItems() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Clear existing items
        const deleteResult = await Item.deleteMany({});
        console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing items`);
        
        // Add new items
        const savedItems = [];
        for (const itemData of initialItems) {
            const item = new Item(itemData);
            const savedItem = await item.save();
            savedItems.push(savedItem);
        }
        
        console.log(`✅ Successfully added ${savedItems.length} items to the shop`);
        console.log('📦 Item types:');
        
        const typesCount = {};
        savedItems.forEach(item => {
            typesCount[item.type] = (typesCount[item.type] || 0) + 1;
        });
        
        Object.entries(typesCount).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} items`);
        });
        
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing items:', error);
        process.exit(1);
    }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
    initializeItems();
}

module.exports = { initialItems, initializeItems };