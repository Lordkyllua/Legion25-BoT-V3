const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Buy an item from the shop with your gold')
        .addIntegerOption(option =>
            option.setName('item_id')
                .setDescription('The ID of the item you want to buy')
                .setRequired(true)),
    
    async execute(interaction) {
        try {
            const itemId = interaction.options.getInteger('item_id');
            const userId = interaction.user.id;
            
            // Cargar la tienda
            const storePath = './store.json';
            if (!fs.existsSync(storePath)) {
                return await interaction.reply({
                    content: '❌ The shop is currently unavailable. Please try again later.',
                    ephemeral: true
                });
            }
            
            const storeData = fs.readFileSync(storePath, 'utf8');
            const store = JSON.parse(storeData);
            const item = store.items.find(i => i.id === itemId);
            
            if (!item) {
                return await interaction.reply({
                    content: '❌ Item not found! Use `/shop` to see available items.',
                    ephemeral: true
                });
            }
            
            // Obtener perfil del usuario
            const profile = rpgUtil.getUserProfile(userId);
            
            // Verificar si tiene suficiente oro
            if (profile.gold < item.price) {
                return await interaction.reply({
                    content: `❌ You don't have enough gold! You need ${item.price} gold but you have ${profile.gold} gold.`,
                    ephemeral: true
                });
            }
            
            // Verificar requisitos de nivel
            if (item.requiredLevel && profile.level < item.requiredLevel) {
                return await interaction.reply({
                    content: `❌ You need to be level ${item.requiredLevel} to buy this item. You are level ${profile.level}.`,
                    ephemeral: true
                });
            }
            
            // Verificar requisitos de clase
            if (item.class && item.class !== 'all') {
                if (!profile.class) {
                    return await interaction.reply({
                        content: `❌ This item is only for ${item.class} class. You need to choose a class first with /class.`,
                        ephemeral: true
                    });
                }
                
                if (profile.class !== item.class) {
                    const classNames = {
                        warrior: 'Warrior',
                        mage: 'Mage',
                        archer: 'Archer'
                    };
                    return await interaction.reply({
                        content: `❌ This item is only for ${classNames[item.class]} class. You are ${profile.className}.`,
                        ephemeral: true
                    });
                }
            }
            
            // Inicializar inventario si no existe
            if (!profile.inventory) {
                profile.inventory = [];
            }
            
            // Verificar si ya tiene el item (para algunos tipos)
            if (item.type === 'equipment') {
                const hasSimilar = profile.inventory.some(invItem => 
                    invItem.type === 'equipment' && invItem.category === item.category
                );
                
                if (hasSimilar) {
                    const embed = new EmbedBuilder()
                        .setColor(0xffa500)
                        .setTitle('⚠️ Equipment Replacement')
                        .setDescription(`You already have an item in the ${item.category} slot.`)
                        .addFields({
                            name: '💡 Suggestion',
                            value: 'Consider if this new item is better than your current one.'
                        })
                        .setFooter({ 
                            text: 'You can still purchase it if you want • Developed by LordK',
                            iconURL: interaction.client.user.displayAvatarURL()
                        });

                    // Aquí podrías agregar un botón de confirmación
                    // Por ahora continuamos con la compra
                }
            }
            
            // Restar el oro
            profile.gold -= item.price;
            
            // Añadir item al inventario
            profile.inventory.push({
                id: item.id,
                name: item.name,
                type: item.type,
                category: item.category,
                description: item.description,
                price: item.price,
                purchasedAt: new Date().toISOString(),
                effects: item.effect
            });
            
            // Guardar cambios en la base de datos
            const databasePath = './database.json';
            const databaseData = fs.existsSync(databasePath) ? 
                fs.readFileSync(databasePath, 'utf8') : '{"users": {}}';
            const database = JSON.parse(databaseData);
            
            if (!database.users) database.users = {};
            if (!database.users[userId]) database.users[userId] = {};
            database.users[userId].rpg = profile;
            
            fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
            
            // Crear embed de confirmación
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Purchase Successful!')
                .setDescription(`You bought **${item.name}** for ${item.price} gold!`)
                .addFields(
                    {
                        name: '📦 Item Details',
                        value: `${item.description}\n**Type:** ${item.type}\n**Category:** ${item.category}`,
                        inline: false
                    },
                    {
                        name: '💰 Your Balance',
                        value: `**Remaining gold:** ${profile.gold} 🥇`,
                        inline: true
                    },
                    {
                        name: '🎒 Inventory',
                        value: `**Total items:** ${profile.inventory.length}`,
                        inline: true
                    }
                );
            
            // Mensaje especial para equipo
            if (item.type === 'equipment') {
                embed.addFields({
                    name: '⚡ Equipment Tip',
                    value: 'This item is now in your inventory. Better equipment improves your stats!',
                    inline: false
                });
            }
            
            embed.setFooter({ 
                text: 'Item added to your inventory • Use /inventory to view • Developed by LordK', 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in buy command:', error);
            await interaction.reply({
                content: '❌ Error processing your purchase. Please try again later.',
                ephemeral: true
            });
        }
    }
};