const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with all commands and features'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 Legion25 Bot - Command Center')
            .setDescription(`**Welcome to Legion25 RPG Bot!**\n\n*"Where every command begins a new adventure..."*\n\nBrowse through the categories below to learn about all available features.`)
            .setColor(0x00AE86)
            .setThumbnail('https://i.imgur.com/xRk7Qq3.png')
            .addFields(
                { 
                    name: '🛠️ General Commands', 
                    value: '```/help - Show this help menu\n/ranking - View gold and level leaderboards\n/roles - Select server roles\n/shop - Browse magical items\n/buy - Purchase items with gold\n/inventory - Manage your items and equipment\n/coinflip - Bet gold on coin flip\n/gif - Get fun GIFs\n/microhunter - Information about the inspiration game```',
                    inline: false
                },
                { 
                    name: '⚔️ RPG System Commands', 
                    value: '```/rpg - Character creation and management\n/quest - Start adventures for rewards\n/fight - Challenge other players (Coming Soon)\n\nCharacter Features:\n• Choose from Mage, Warrior, or Archer\n• Level up to 100 with evolutions\n• Equip weapons, armor, and accessories\n• Complete quests for gold and experience\n• Track your progress with achievements```',
                    inline: false
                },
                { 
                    name: '🛡️ Administration Commands', 
                    value: '```/roleadmin - Manage selectable roles\n/warn - Warn users\n/warnings - Check user warnings\n/mute - Moderate users\n/givegold - Give gold to users (Admin)\n/giveexp - Give experience to users (Admin)```',
                    inline: false
                },
                { 
                    name: '💰 Economy System', 
                    value: '**Gold Sources:**\n• Completing quests\n• Winning coin flips\n• Leveling up\n• Admin rewards\n\n**Item Types:**\n• ⚔️ Weapons (class-specific)\n• 🛡️ Armor (class-specific)\n• 💎 Accessories\n• 🧪 Potions (health, mana)\n• 📦 Consumables',
                    inline: false
                },
                { 
                    name: '🎯 Quest System', 
                    value: '**Difficulty Levels:**\n• 🟢 Easy (80% success)\n• 🟡 Medium (60% success)\n• 🔴 Hard (40% success)\n\n**Rewards:**\n• Experience points\n• Gold coins\n• Character progression',
                    inline: false
                },
                { 
                    name: '⭐ Character Progression', 
                    value: '**Evolutions:**\n• Mage: Apprentice → Wizard → Archmage → Mage Lord\n• Warrior: Squire → Knight → Champion → War Lord\n• Archer: Hunter → Ranger → Sharpshooter → Bow Master\n\n**Features:**\n• Level-based stat increases\n• Class-specific skills\n• Equipment bonuses\n• Achievement system',
                    inline: false
                }
            )
            .setFooter({ 
                text: 'Developed with ❤️ by LordK • Inspired by Micro Hunter',
                iconURL: 'https://i.imgur.com/7VQ0mOp.png'
            });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_rpg')
                    .setLabel('RPG Guide')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⚔️'),
                new ButtonBuilder()
                    .setCustomId('help_shop')
                    .setLabel('Shop Guide')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏪'),
                new ButtonBuilder()
                    .setCustomId('help_quests')
                    .setLabel('Quest Guide')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🏹'),
                new ButtonBuilder()
                    .setCustomId('help_admin')
                    .setLabel('Admin Guide')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🛡️')
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};