const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'help_combat',
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚔️ Combat System Guide')
            .setColor(0xE74C3C)
            .setDescription('Complete guide to battles, monsters, and combat mechanics')
            .addFields(
                { 
                    name: '🎯 Starting Battles', 
                    value: 'Use `/fight [type]` to start a battle:\n• **monster** - Regular enemies (balanced rewards)\n• **boss** - Powerful bosses (2x EXP, 3x Gold)\n• **elite** - Strong elite enemies (1.5x rewards)',
                    inline: false 
                },
                { 
                    name: '⚔️ Combat Actions', 
                    value: '**Attack** - Basic physical attack (no cost)\n**Special Attack** - Powerful magic attack (costs 20 MP)\n**Flee** - 70% chance to escape battle',
                    inline: false 
                },
                { 
                    name: '💥 Damage System', 
                    value: '• **Base Damage**: Calculated from your attack vs enemy defense\n• **Critical Hits**: Random chance for 2x damage\n• **Special Attacks**: Deal 1.5x damage but consume MP\n• **Class Bonuses**: Each class has unique damage modifiers',
                    inline: false 
                },
                { 
                    name: '🎁 Battle Rewards', 
                    value: '**Victory Rewards:**\n• Experience Points (⭐)\n• Gold coins (🪙)\n• Monster defeat count increase\n\n**Boss Bonuses:**\n• 2x Experience\n• 3x Gold\n• Higher achievement progress',
                    inline: false 
                },
                { 
                    name: '🛡️ Combat Stats', 
                    value: '**HP** - Health Points (0 = defeated)\n**MP** - Magic Points (for special attacks)\n**Attack** - Physical damage output\n**Defense** - Damage reduction\n**Magic** - Spell power and special attack damage\n**Agility** - Critical hit chance and evasion',
                    inline: false 
                },
                { 
                    name: '💡 Combat Tips', 
                    value: '1. Monitor your HP and MP during battles\n2. Use Special Attacks when you have enough MP\n3. Flee if the battle is too difficult\n4. Level up to increase your stats\n5. Defeat monsters to unlock achievements',
                    inline: false 
                },
                { 
                    name: '🛠️ Available Commands', 
                    value: '```/fight - Start a battle\n/rpg - Check your stats and HP/MP\n/inventory - Use healing items```',
                    inline: false 
                }
            )
            .setFooter({ text: 'Victory goes to the prepared! Check your stats with /rpg' });

        const backButton = new ButtonBuilder()
            .setCustomId('help_main')
            .setLabel('Back to Main Help')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⬅️');

        const row = new ActionRowBuilder().addComponents(backButton);

        await interaction.update({ embeds: [embed], components: [row] });
    },
};