const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const rpgUtil = require('../utils/rpg');
const pointsUtil = require('../utils/points');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription('Explore different locations for unique rewards'),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const profile = rpgUtil.getUserProfile(userId);
            
            const locations = [
                {
                    name: '🌲 Ancient Forest',
                    description: 'A mysterious forest full of secrets and basic resources',
                    levelReq: 1,
                    rewards: { minGold: 10, maxGold: 30, minExp: 5, maxExp: 15, itemChance: 20 },
                    danger: 'Low'
                },
                {
                    name: '🏔️ Mountain Pass',
                    description: 'A dangerous mountain path with better rewards',
                    levelReq: 5,
                    rewards: { minGold: 20, maxGold: 50, minExp: 10, maxExp: 25, itemChance: 35 },
                    danger: 'Medium'
                },
                {
                    name: '🏰 Abandoned Castle',
                    description: 'An old castle rumored to hold great treasures',
                    levelReq: 10,
                    rewards: { minGold: 30, maxGold: 70, minExp: 15, maxExp: 35, itemChance: 50 },
                    danger: 'High'
                },
                {
                    name: '🌋 Dragon\'s Lair',
                    description: 'A volcanic lair guarded by powerful creatures',
                    levelReq: 15,
                    rewards: { minGold: 50, maxGold: 100, minExp: 25, maxExp: 50, itemChance: 70 },
                    danger: 'Very High'
                },
                {
                    name: '✨ Magic Academy',
                    description: 'A school of magic with arcane knowledge (Mages only)',
                    levelReq: 8,
                    rewards: { minGold: 25, maxGold: 60, minExp: 20, maxExp: 40, itemChance: 60 },
                    danger: 'Medium',
                    classReq: 'mage'
                },
                {
                    name: '⚔️ Warrior Camp',
                    description: 'A training ground for elite warriors (Warriors only)',
                    levelReq: 8,
                    rewards: { minGold: 25, maxGold: 60, minExp: 20, maxExp: 40, itemChance: 60 },
                    danger: 'Medium',
                    classReq: 'warrior'
                },
                {
                    name: '🏹 Archer Range',
                    description: 'A hidden archery range (Archers only)',
                    levelReq: 8,
                    rewards: { minGold: 25, maxGold: 60, minExp: 20, maxExp: 40, itemChance: 60 },
                    danger: 'Medium',
                    classReq: 'archer'
                }
            ];

            // Filtrar ubicaciones disponibles
            const availableLocations = locations.filter(loc => 
                profile.level >= loc.levelReq && 
                (!loc.classReq || profile.class === loc.classReq)
            );

            if (availableLocations.length === 0) {
                return await interaction.reply({
                    content: '❌ You need to be at least level 1 to explore locations.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('🗺️ Exploration Locations')
                .setDescription('Choose a location to explore for rewards!')
                .setFooter({ 
                    text: `Your level: ${profile.level} • Class: ${profile.className || 'None'} • Developed by LordK`,
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            availableLocations.forEach(loc => {
                const requirements = [];
                if (loc.levelReq > 1) requirements.push(`Level ${loc.levelReq}+`);
                if (loc.classReq) requirements.push(`${loc.classReq} only`);
                
                embed.addFields({
                    name: `${loc.name} [${loc.danger}]`,
                    value: `${loc.description}\n**Rewards:** ${loc.rewards.minGold}-${loc.rewards.maxGold} gold, ${loc.rewards.minExp}-${loc.rewards.maxExp} EXP\n**Requirements:** ${requirements.join(', ') || 'None'}`,
                    inline: false
                });
            });

            // Crear botones para ubicaciones (máximo 5)
            const rows = [];
            let currentRow = new ActionRowBuilder();
            
            availableLocations.slice(0, 5).forEach((loc, index) => {
                if (index > 0 && index % 5 === 0) {
                    rows.push(currentRow);
                    currentRow = new ActionRowBuilder();
                }
                
                currentRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`explore_${loc.name.replace(/\s+/g, '_')}`)
                        .setLabel(loc.name.split(' ')[1] || loc.name)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(loc.name.split(' ')[0])
                );
            });
            
            if (currentRow.components.length > 0) {
                rows.push(currentRow);
            }

            await interaction.reply({ 
                embeds: [embed], 
                components: rows 
            });
            
        } catch (error) {
            console.error('Error in explore command:', error);
            await interaction.reply({
                content: '❌ Error loading exploration locations. Please try again later.',
                ephemeral: true
            });
        }
    }
};