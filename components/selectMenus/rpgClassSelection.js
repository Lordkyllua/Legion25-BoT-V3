const { EmbedBuilder } = require('discord.js');
const { createCharacter } = require('../../utils/rpg');
const { addGold } = require('../../utils/gold');

module.exports = {
    customId: 'rpg_class_selection',
    async execute(interaction) {
        const selectedClass = interaction.values[0];
        
        // Create character
        const character = createCharacter(interaction.user.id, selectedClass);
        
        const classInfo = {
            mage: {
                color: 0x9B59B6,
                description: 'Master of arcane arts, wielding powerful spells that can change the course of battles.',
                special: 'High Magic Power',
                abilities: 'Fireball, Magic Shield, Teleport'
            },
            warrior: {
                color: 0xE74C3C,
                description: 'Mighty champion with unmatched strength and resilience on the battlefield.',
                special: 'High Defense & HP',
                abilities: 'Power Strike, Taunt, Shield Bash'
            },
            archer: {
                color: 0x27AE60,
                description: 'Deadly precision and unmatched agility, striking from distances with perfect accuracy.',
                special: 'High Agility & Critical',
                abilities: 'Quick Shot, Dodge, Multi-shot'
            }
        };

        const info = classInfo[selectedClass];

        const embed = new EmbedBuilder()
            .setTitle(`🎉 Welcome, ${interaction.user.username}!`)
            .setDescription(`**You have chosen the path of the ${selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1)}!**\n\n${info.description}`)
            .setColor(info.color)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: '⭐ Starting Level', value: 'Level 1', inline: true },
                { name: '💰 Starting Gold', value: '🪙 50', inline: true },
                { name: '🎯 Specialization', value: info.special, inline: true },
                { name: '📚 Starting Abilities', value: info.abilities, inline: true },
                { name: '❤️ Base HP', value: character.maxHp.toString(), inline: true },
                { name: '💙 Base MP', value: character.maxMp.toString(), inline: true },
                { name: '⚔️ Base Attack', value: character.attack.toString(), inline: true },
                { name: '🛡️ Base Defense', value: character.defense.toString(), inline: true }
            )
            .setFooter({ text: 'Your adventure begins now! Use /rpg to check your status.' });

        await interaction.update({ embeds: [embed], components: [] });
    },
};