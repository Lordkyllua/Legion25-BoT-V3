const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const { getGold } = require('../utils/gold');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('Manage your RPG character and check stats'),
    async execute(interaction) {
        const database = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
        const userId = interaction.user.id;

        if (!database.users[userId]) {
            // New user - show class selection
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('rpg_class_selection')
                .setPlaceholder('Choose your destiny...')
                .addOptions([
                    {
                        label: '🔮 Mage',
                        value: 'mage',
                        description: 'Master of arcane arts and powerful spells',
                        emoji: '🔮'
                    },
                    {
                        label: '⚔️ Warrior',
                        value: 'warrior',
                        description: 'Mighty champion with unmatched strength',
                        emoji: '⚔️'
                    },
                    {
                        label: '🏹 Archer',
                        value: 'archer',
                        description: 'Deadly precision and unmatched agility',
                        emoji: '🏹'
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const embed = new EmbedBuilder()
                .setTitle('🎮 Choose Your Hero Class')
                .setDescription('**Welcome to the world of Legion25 RPG!**\n\nSelect your class to begin your epic adventure. Each class has unique strengths and abilities that will shape your journey.')
                .setColor(0x9B59B6)
                .setThumbnail('https://i.imgur.com/xRk7Qq3.png')
                .addFields(
                    { 
                        name: '🔮 Mage', 
                        value: '• High magical power\n• Powerful area spells\n• Low physical defense\n• **Specialty**: Elemental Magic', 
                        inline: true 
                    },
                    { 
                        name: '⚔️ Warrior', 
                        value: '• High health and defense\n• Strong physical attacks\n• Low magical ability\n• **Specialty**: Melee Combat', 
                        inline: true 
                    },
                    { 
                        name: '🏹 Archer', 
                        value: '• Excellent agility\n• Ranged superiority\n• Balanced stats\n• **Specialty**: Precision Shots', 
                        inline: true 
                    }
                )
                .setFooter({ text: 'Your choice will determine your path. Choose wisely!' });

            await interaction.reply({ embeds: [embed], components: [row] });
        } else {
            // Existing user - show character info
            const user = database.users[userId];
            const userGold = getGold(userId);
            
            const embed = new EmbedBuilder()
                .setTitle(`🧙‍♂️ ${interaction.user.username}'s Character`)
                .setColor(getClassColor(user.class))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(`**${user.evolution} ${user.class.charAt(0).toUpperCase() + user.class.slice(1)}**`)
                .addFields(
                    { name: '⭐ Level', value: `**${user.level}**`, inline: true },
                    { name: '📊 Experience', value: `${user.exp}/${user.maxExp}`, inline: true },
                    { name: '💰 Gold', value: `🪙 ${userGold}`, inline: true },
                    { name: '❤️ HP', value: `${user.hp}/${user.maxHp}`, inline: true },
                    { name: '💙 MP', value: `${user.mp}/${user.maxMp}`, inline: true },
                    { name: '⚔️ Attack', value: user.attack.toString(), inline: true },
                    { name: '🛡️ Defense', value: user.defense.toString(), inline: true },
                    { name: '🔮 Magic', value: user.magic.toString(), inline: true },
                    { name: '🎯 Agility', value: user.agility.toString(), inline: true }
                )
                .setFooter({ text: `Adventuring since ${new Date(user.createdAt).toLocaleDateString()}` });

            // Add evolution info if close to next evolution
            const nextEvolution = getNextEvolution(user);
            if (nextEvolution) {
                embed.addFields({
                    name: '✨ Next Evolution',
                    value: `**${nextEvolution.name}** at Level ${nextEvolution.level}`,
                    inline: false
                });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('rpg_inventory')
                        .setLabel('Inventory')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🎒'),
                    new ButtonBuilder()
                        .setCustomId('rpg_skills')
                        .setLabel('Skills')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📚'),
                    new ButtonBuilder()
                        .setCustomId('rpg_quests')
                        .setLabel('Quests')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🏹')
                );

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    },
};

function getClassColor(className) {
    const colors = {
        mage: 0x9B59B6,
        warrior: 0xE74C3C,
        archer: 0x27AE60
    };
    return colors[className] || 0x95A5A6;
}

function getNextEvolution(user) {
    const evolutionLevels = {
        mage: [20, 50, 80],
        warrior: [20, 50, 80],
        archer: [20, 50, 80]
    };
    
    const levels = evolutionLevels[user.class];
    for (const level of levels) {
        if (user.level < level) {
            return { level: level, name: getEvolutionName(user.class, level) };
        }
    }
    return null;
}

function getEvolutionName(className, level) {
    const names = {
        mage: { 20: 'Wizard', 50: 'Archmage', 80: 'Mage Lord' },
        warrior: { 20: 'Knight', 50: 'Champion', 80: 'War Lord' },
        archer: { 20: 'Ranger', 50: 'Sharpshooter', 80: 'Bow Master' }
    };
    return names[className][level];
}