const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unequip')
        .setDescription('Unequip an item from your character')
        .addStringOption(option =>
            option.setName('item_type')
                .setDescription('Type of item to unequip')
                .addChoices(
                    { name: 'Weapon', value: 'weapon' },
                    { name: 'Armor', value: 'armor' },
                    { name: 'Accessory', value: 'accessory' }
                )
                .setRequired(true)),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const itemType = interaction.options.getString('item_type');
            
            const result = rpgUtil.unequipItem(userId, itemType);
            
            if (result.success) {
                const profile = rpgUtil.getUserProfile(userId);
                
                const embed = new EmbedBuilder()
                    .setColor(0xff9900)
                    .setTitle('✅ Item Unequipped!')
                    .setDescription(result.message)
                    .addFields(
                        {
                            name: '🎯 Updated Stats',
                            value: `⚔️ Attack: ${profile.stats.attack}\n🛡️ Defense: ${profile.stats.defense}\n🔮 Magic: ${profile.stats.magic}\n🎯 Agility: ${profile.stats.agility}`,
                            inline: true
                        },
                        {
                            name: '⚡ Current Equipment',
                            value: `Weapon: ${profile.equipment.weapon.name}\nArmor: ${profile.equipment.armor.name}\nAccessory: ${profile.equipment.accessory.name}`,
                            inline: true
                        }
                    )
                    .setFooter({ 
                        text: 'Item moved back to inventory • Developed by LordK',
                        iconURL: interaction.user.displayAvatarURL()
                    });
                
                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({
                    content: result.message,
                    ephemeral: true
                });
            }
            
        } catch (error) {
            console.error('Error in unequip command:', error);
            await interaction.reply({
                content: '❌ Error unequipping item. Please try again.',
                ephemeral: true
            });
        }
    }
};