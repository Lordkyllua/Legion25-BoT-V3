const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    customId: 'rpg_skills',
    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findById(userId);

        if (!user || !user.rpg) {
            await interaction.reply({ 
                content: 'You need to create a character first! Use `/rpg` to get started.', 
                ephemeral: true 
            });
            return;
        }

        const rpg = user.rpg;
        const skills = rpg.skills || getDefaultSkills(rpg.class);
        
        const embed = new EmbedBuilder()
            .setTitle(`📚 ${interaction.user.username}'s Skills`)
            .setColor(0x9B59B6)
            .setDescription(`**${rpg.evolution} ${rpg.class.charAt(0).toUpperCase() + rpg.class.slice(1)}**`)
            .setFooter({ text: 'Skills will unlock as you level up!' });

        if (skills.length === 0) {
            embed.addFields({
                name: 'No Skills Yet',
                value: 'You will unlock skills as you level up your character!',
                inline: false
            });
        } else {
            skills.forEach((skill, index) => {
                embed.addFields({
                    name: `Skill #${index + 1}: ${skill}`,
                    value: getSkillDescription(skill, rpg.class),
                    inline: false
                });
            });
        }

        // Add upcoming skills based on level
        const upcomingSkills = getUpcomingSkills(rpg.class, rpg.level);
        if (upcomingSkills.length > 0) {
            embed.addFields({
                name: '🔮 Upcoming Skills',
                value: upcomingSkills.map(skill => `• ${skill.name} (Level ${skill.level})`).join('\n'),
                inline: false
            });
        }

        await interaction.reply({ 
            embeds: [embed], 
            ephemeral: true 
        });
    },
};

function getDefaultSkills(className) {
    const defaultSkills = {
        mage: ['Fireball', 'Magic Shield'],
        warrior: ['Power Strike', 'Taunt'],
        archer: ['Quick Shot', 'Dodge']
    };
    return defaultSkills[className] || [];
}

function getSkillDescription(skill, className) {
    const descriptions = {
        'Fireball': 'Launches a ball of fire that deals magic damage to enemies',
        'Magic Shield': 'Creates a protective barrier that reduces incoming damage',
        'Power Strike': 'A powerful melee attack that deals extra damage',
        'Taunt': 'Forces enemies to attack you, protecting your allies',
        'Quick Shot': 'Rapidly fires arrows with increased attack speed',
        'Dodge': 'Increases evasion chance against enemy attacks'
    };
    return descriptions[skill] || 'A powerful ability unique to your class.';
}

function getUpcomingSkills(className, currentLevel) {
    const upcoming = {
        mage: [
            { name: 'Ice Blast', level: 10 },
            { name: 'Lightning Strike', level: 20 },
            { name: 'Meteor Shower', level: 35 }
        ],
        warrior: [
            { name: 'Shield Bash', level: 10 },
            { name: 'Whirlwind', level: 20 },
            { name: 'Berserker Rage', level: 35 }
        ],
        archer: [
            { name: 'Poison Arrow', level: 10 },
            { name: 'Multi-shot', level: 20 },
            { name: 'Eagle Eye', level: 35 }
        ]
    };
    
    return upcoming[className]?.filter(skill => skill.level > currentLevel) || [];
}