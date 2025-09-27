const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Manage your inventory and equip items')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('What do you want to do?')
                .addChoices(
                    { name: 'View Inventory', value: 'view' },
                    { name: 'Equip Item', value: 'equip' },
                    { name: 'Unequip Item', value: 'unequip' }
                )
                .setRequired(false)),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const action = interaction.options.getString('action') || 'view';
            
            if (action === 'view') {
                await showInventory(interaction, userId);
            } else if (action === 'equip') {
                await showEquipMenu(interaction, userId);
            } else if (action === 'unequip') {
                await showUnequipMenu(interaction, userId);
            }
            
        } catch (error) {
            console.error('Error in inventory command:', error);
            await interaction.reply({
                content: '❌ Error accessing inventory. Please try again.',
                ephemeral: true
            });
        }
    }
};

// Show inventory function
async function showInventory(interaction, userId) {
    const inventoryData = rpgUtil.getInventory(userId);
    const profile = rpgUtil.getUserProfile(userId);
    
    if (!inventoryData.success || !inventoryData.inventory) {
        return await interaction.reply({
            content: '❌ Error loading inventory data.',
            ephemeral: true
        });
    }
    
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('🎒 Your Inventory')
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
            {
                name: '💰 Gold',
                value: `${profile.gold} 🥇`,
                inline: true
            },
            {
                name: '📦 Total Items',
                value: `${inventoryData.inventory.length} items`,
                inline: true
            },
            {
                name: '⚔️ Equipped Items',
                value: `Weapon: ${profile.equipment.weapon.name}\nArmor: ${profile.equipment.armor.name}\nAccessory: ${profile.equipment.accessory.name}`,
                inline: false
            }
        );
    
    // Group items by type
    const weapons = inventoryData.inventory.filter(item => item.type === 'weapon' || item.category?.includes('Weapon'));
    const armors = inventoryData.inventory.filter(item => item.type === 'armor' || item.category?.includes('Armor'));
    const consumables = inventoryData.inventory.filter(item => item.type === 'consumable');
    const cosmetics = inventoryData.inventory.filter(item => item.type === 'cosmetic');
    
    if (weapons.length > 0) {
        embed.addFields({
            name: '⚔️ Weapons',
            value: weapons.map(item => `${item.equipped ? '🔸 ' : ''}${item.name} ${item.equipped ? '(Equipped)' : ''}`).join('\n') || 'None',
            inline: true
        });
    }
    
    if (armors.length > 0) {
        embed.addFields({
            name: '🛡️ Armors',
            value: armors.map(item => `${item.equipped ? '🔸 ' : ''}${item.name} ${item.equipped ? '(Equipped)' : ''}`).join('\n') || 'None',
            inline: true
        });
    }
    
    if (consumables.length > 0) {
        embed.addFields({
            name: '🧪 Consumables',
            value: consumables.map(item => `${item.name} (${item.description})`).join('\n') || 'None',
            inline: true
        });
    }
    
    if (inventoryData.inventory.length === 0) {
        embed.addFields({
            name: '📭 Empty Inventory',
            value: 'Your inventory is empty! Visit `/shop` to buy some items.'
        });
    }
    
    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('inventory_equip')
                .setLabel('Equip Items')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚔️'),
            new ButtonBuilder()
                .setCustomId('inventory_unequip')
                .setLabel('Unequip Items')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📦')
        );
    
    await interaction.reply({ 
        embeds: [embed], 
        components: [actionRow] 
    });
}

// Show equip menu function
async function showEquipMenu(interaction, userId) {
    const inventoryData = rpgUtil.getInventory(userId);
    
    const unequippedItems = inventoryData.inventory.filter(item => !item.equipped);
    
    if (unequippedItems.length === 0) {
        return await interaction.reply({
            content: '❌ You have no items to equip. Buy some from `/shop` first.',
            ephemeral: true
        });
    }
    
    const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('⚔️ Equip Items')
        .setDescription('Select an item to equip:')
        .addFields(
            unequippedItems.slice(0, 10).map(item => ({
                name: `${item.name} (${item.type})`,
                value: `Price: ${item.price} gold | ${item.description || 'No description'}`,
                inline: false
            }))
        );
    
    if (unequippedItems.length > 10) {
        embed.addFields({
            name: '📋 Note',
            value: `Showing 10 of ${unequippedItems.length} items. Use the item ID with \`/equip <item_id>\``
        });
    }
    
    await interaction.reply({ 
        content: 'Use `/equip <item_id>` to equip an item. Example: `/equip 5`',
        embeds: [embed],
        ephemeral: true 
    });
}

// Show unequip menu function
async function showUnequipMenu(interaction, userId) {
    const profile = rpgUtil.getUserProfile(userId);
    const equippedItems = [];
    
    if (profile.equipment.weapon.id !== 0) equippedItems.push(profile.equipment.weapon);
    if (profile.equipment.armor.id !== 0) equippedItems.push(profile.equipment.armor);
    if (profile.equipment.accessory.id !== 0) equippedItems.push(profile.equipment.accessory);
    
    if (equippedItems.length === 0) {
        return await interaction.reply({
            content: '❌ You have no items equipped.',
            ephemeral: true
        });
    }
    
    const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle('📦 Unequip Items')
        .setDescription('Select an item to unequip:')
        .addFields(
            equippedItems.map(item => ({
                name: `${item.name} (${item.type})`,
                value: `Currently equipped in ${item.type} slot`,
                inline: false
            }))
        );
    
    await interaction.reply({ 
        content: 'Use `/unequip <item_type>` to unequip. Example: `/unequip weapon`',
        embeds: [embed],
        ephemeral: true 
    });
}