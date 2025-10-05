const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

const classSkills = {
    Warrior: [
        { name: 'Charge', level: 1, description: 'Charge at enemy for 150% damage' },
        { name: 'Shield Bash', level: 5, description: 'Stun enemy for 1 turn' },
        { name: 'Whirlwind', level: 15, description: 'Attack all enemies' }
    ],
    Mage: [
        { name: 'Fireball', level: 1, description: 'Launch fireball for 200% magic damage' },
        { name: 'Heal', level: 5, description: 'Heal 50% of max health' },
        { name: 'Meteor', level: 15, description: 'Massive area damage' }
    ],
    Archer: [
        { name: 'Multi-shot', level: 1, description: 'Shoot 3 arrows at once' },
        { name: 'Dodge', level: 5, description: 'Dodge next attack' },
        { name: 'Snipe', level: 15, description: '300% damage critical hit' }
    ]
};

module.exports = {
    name: 'rpg_skills',
    
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        
        if (!user) {
            return await interaction.reply({ 
                content: '❌ You need to start your RPG journey first!', 
                ephemeral: true 
            });
        }

        const skills = classSkills[user.class] || [];
        const embed = new EmbedBuilder()
            .setTitle(`🔮 ${user.class} Skills`)
            .setColor(0x3498DB)
            .setDescription(`Available skills for ${user.class} class`);

        skills.forEach(skill => {
            const unlocked = user.level >= skill.level;
            embed.addFields({
                name: `${unlocked ? '✅' : '🔒'} ${skill.name} (Level ${skill.level})`,
                value: `${skill.description}${unlocked ? '' : ' - **Locked**'}`,
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};