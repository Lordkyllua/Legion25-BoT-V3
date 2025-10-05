const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

const classStats = {
    warrior: { strength: 10, intelligence: 3, agility: 5, defense: 8, health: 120 },
    mage: { strength: 3, intelligence: 10, agility: 5, defense: 4, mana: 80 },
    archer: { strength: 6, intelligence: 4, agility: 10, defense: 6, health: 90 }
};

module.exports = {
    name: 'class_selection',
    
    async execute(interaction) {
        const selectedClass = interaction.values[0];
        const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });

        if (!user) {
            return await interaction.reply({ 
                content: '❌ You need to start your RPG journey first!', 
                ephemeral: true 
            });
        }

        if (user.class !== 'Novice') {
            return await interaction.reply({ 
                content: '❌ You have already chosen a class!', 
                ephemeral: true 
            });
        }

        const stats = classStats[selectedClass];
        user.class = selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1);
        user.strength = stats.strength;
        user.intelligence = stats.intelligence;
        user.agility = stats.agility;
        user.defense = stats.defense;
        user.maxHealth = stats.health || 100;
        user.health = user.maxHealth;
        user.maxMana = stats.mana || 50;
        user.mana = user.maxMana;

        await user.save();

        const classInfo = {
            warrior: '⚔️ **Warrior** - A mighty fighter specializing in close combat and defense.',
            mage: '🔮 **Mage** - A powerful spellcaster wielding elemental and arcane magic.',
            archer: '🏹 **Archer** - A nimble marksman with exceptional accuracy and agility.'
        };

        const embed = new EmbedBuilder()
            .setTitle('🎉 Class Selected!')
            .setColor(0x9B59B6)
            .setDescription(`You are now a **${user.class}**!`)
            .addFields(
                { name: '📊 Base Stats', value: `💪 Strength: ${stats.strength}\n🧠 Intelligence: ${stats.intelligence}\n⚡ Agility: ${stats.agility}\n🛡️ Defense: ${stats.defense}`, inline: true },
                { name: '❤️ Resources', value: `Health: ${user.maxHealth}\nMana: ${user.maxMana}`, inline: true },
                { name: '🎯 Class Description', value: classInfo[selectedClass], inline: false }
            )
            .setFooter({ text: 'Use /quest to start your first adventure!' });

        await interaction.update({ content: null, embeds: [embed], components: [] });
    }
};