const { EmbedBuilder } = require('discord.js');
const Item = require('../../models/Item');

const defaultItems = [
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
        itemId: 'apprentice_robe',
        name: 'Apprentice Robe',
        description: 'Basic magical attire',
        type: 'armor',
        rarity: 'common',
        levelRequirement: 1,
        price: 40,
        defense: 3,
        intelligence: 2
    },
    {
        itemId: 'health_potion',
        name: 'Health Potion',
        description: 'Restores 50 health',
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
        description: 'Restores 30 mana',
        type: 'potion',
        rarity: 'common',
        levelRequirement: 1,
        price: 20,
        mana: 30,
        consumable: true
    }
];

const advancedItems = [
    {
        itemId: 'dragon_slayer',
        name: 'Dragon Slayer',
        description: 'Legendary sword that can slay dragons',
        type: 'weapon',
        rarity: 'legendary',
        levelRequirement: 50,
        classRequirement: 'Warrior',
        price: 5000,
        damage: 50,
        strength: 15,
        criticalChance: 10
    },
    {
        itemId: 'archmage_staff',
        name: 'Archmage Staff',
        description: 'Staff wielded by the most powerful mages',
        type: 'weapon',
        rarity: 'legendary',
        levelRequirement: 50,
        classRequirement: 'Mage',
        price: 4800,
        damage: 40,
        intelligence: 20,
        mana: 30
    },
    {
        itemId: 'phoenix_bow',
        name: 'Phoenix Bow',
        description: 'Bow that fires arrows of pure fire',
        type: 'weapon',
        rarity: 'legendary',
        levelRequirement: 50,
        classRequirement: 'Archer',
        price: 4600,
        damage: 45,
        agility: 18,
        criticalChance: 15
    },
    {
        itemId: 'elixir_of_life',
        name: 'Elixir of Life',
        description: 'Fully restores health and mana',
        type: 'potion',
        rarity: 'epic',
        levelRequirement: 30,
        price: 500,
        health: 999,
        mana: 999,
        consumable: true
    }
];

module.exports = {
    name: 'reset_shop_',
    
    async execute(interaction) {
        const action = interaction.customId.replace('reset_shop_', '');
        
        let itemsToAdd = [];
        let message = '';

        switch (action) {
            case 'default':
                itemsToAdd = defaultItems;
                message = '🔄 Shop reset with default beginner items';
                break;
            case 'advanced':
                itemsToAdd = [...defaultItems, ...advancedItems];
                message = '🚀 Shop updated with advanced and legendary items';
                break;
            case 'clear':
                await Item.deleteMany({});
                message = '💥 All shop items cleared';
                break;
        }

        if (action !== 'clear') {
            // Clear existing items
            await Item.deleteMany({});
            
            // Add new items
            for (const itemData of itemsToAdd) {
                const item = new Item(itemData);
                await item.save();
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('✅ Shop Reset Complete')
            .setColor(0x2ECC71)
            .setDescription(message)
            .addFields(
                { name: '📦 Items Added', value: `${itemsToAdd.length} items`, inline: true },
                { name: '🛠️ Action', value: action.toUpperCase(), inline: true },
                { name: '👤 Moderator', value: interaction.user.username, inline: true }
            )
            .setFooter({ text: 'Shop has been successfully updated' });

        await interaction.update({ embeds: [embed], components: [] });
    }
};