const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');
const { getGold } = require('../utils/gold');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('Manage your RPG character and check stats'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findById(userId);

        if (!user || !user.rpg || !user.rpg.class) {
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
                .setThumbnail('https://i.imgur.com/txB085t.jpeg')
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
            const rpg = user.rpg;
            const userGold = await getGold(userId);
            
            const embed = new EmbedBuilder()
                .setTitle(`🧙‍♂️ ${interaction.user.username}'s Character`)
                .setColor(getClassColor(rpg.class))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(`**${rpg.evolution} ${rpg.class.charAt(0).toUpperCase() + rpg.class.slice(1)}**`)
                .addFields(
                    { name: '⭐ Level', value: `**${rpg.level}**`, inline: true },
                    { name: '📊 Experience', value: `${rpg.exp}/${rpg.maxExp}`, inline: true },
                    { name: '💰 Gold', value: `🪙 ${userGold}`, inline: true },
                    { name: '❤️ HP', value: `${rpg.hp}/${rpg.maxHp}`, inline: true },
                    { name: '💙 MP', value: `${rpg.mp}/${rpg.maxMp}`, inline: true },
                    { name: '⚔️ Attack', value: rpg.attack.toString(), inline: true },
                    { name: '🛡️ Defense', value: rpg.defense.toString(), inline: true },
                    { name: '🔮 Magic', value: rpg.magic.toString(), inline: true },
                    { name: '🎯 Agility', value: rpg.agility.toString(), inline: true }
                )
                .setFooter({ text: `Adventuring since ${new Date(user.createdAt).toLocaleDateString()}` });

            // Add evolution info if close to next evolution
            const nextEvolution = getNextEvolution(rpg);
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

function getNextEvolution(rpg) {
    const evolutionLevels = {
        mage: [20, 50, 80],
        warrior: [20, 50, 80],
        archer: [20, 50, 80]
    };
    
    const levels = evolutionLevels[rpg.class];
    for (const level of levels) {
        if (rpg.level < level) {
            return { level: level, name: getEvolutionName(rpg.class, level) };
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