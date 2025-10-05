const mongoose = require('mongoose');
const Item = require('../models/Item');

const initialItems = [
    // Weapons
    {
        itemId: 'wooden_sword',
        name: 'Wooden Sword',
        description: 'A basic sword for beginners',
        type: 'weapon',
        rarity: 'common',
        levelRequirement: 1,
        price: 50,
        damage: 5,
        strength: 2
    },
    {
        itemId: 'apprentice_staff',
        name: 'Apprentice Staff',
        description: 'Basic staff for novice mages',
        type: 'weapon',
        rarity: 'common',
        levelRequirement: 1,
        classRequirement: 'Mage',
        price: 45,
        damage: 4,
        intelligence: 3
    },
    {
        itemId: 'hunting_bow',
        name: 'Hunting Bow',
        description: 'Simple bow for archery practice',
        type: 'weapon',
        rarity: 'common',
        levelRequirement: 1,
        classRequirement: 'Archer',
        price: 48,
        damage: 6,
        agility: 3
    },
    
    // Armor
    {
        itemId: 'leather_armor',
        name: 'Leather Armor',
        description: 'Basic protective leather armor',
        type: 'armor',
        rarity: 'common',
        levelRequirement: 1,
        price: 60,
        defense: 5,
        health: 10
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
        mana: 10
    },
    
    // Potions
    {
        itemId: 'health_potion',
        name: 'Health Potion',
        description: 'Restores 50 health points',
        type: 'potion',
        rarity: 'common',
        levelRequirement: 1,
        price: 25,
        health: 50,
        consumable: true
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
        consumable: true
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
        health: 5
    }
];

async function initializeItems() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Clear existing items
        await Item.deleteMany({});
        console.log('Cleared existing items');
        
        // Add new items
        for (const itemData of initialItems) {
            const item = new Item(itemData);
            await item.save();
        }
        
        console.log(`Successfully added ${initialItems.length} items to the shop`);
        process.exit(0);
    } catch (error) {
        console.error('Error initializing items:', error);
        process.exit(1);
    }
}

initializeItems();