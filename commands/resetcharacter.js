const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');
const Gold = require('../models/Gold');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetcharacter')
        .setDescription('Reset a user\'s character (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose character will be reset')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of reset to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Full Reset (Level 1, No Items)', value: 'full' },
                    { name: 'Soft Reset (Keep Gold)', value: 'soft' },
                    { name: 'Class Change Only', value: 'class' }
                )),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const resetType = interaction.options.getString('type');

        try {
            const user = await User.findById(targetUser.id);
            
            if (!user || !user.rpg) {
                return await interaction.reply({ 
                    content: 'This user does not have a character to reset!', 
                    ephemeral: true 
                });
            }

            const oldCharacter = { ...user.rpg };
            const oldGold = await Gold.getBalance(targetUser.id);

            let resetMessage = '';
            let newCharacter = {};

            switch (resetType) {
                case 'full':
                    // Reset completo - nivel 1, sin items, sin gold
                    await Gold.setBalance(targetUser.id, 50); // Gold inicial
                    newCharacter = await createNewCharacter(targetUser.id, oldCharacter.class);
                    resetMessage = '**Full Reset** - Back to level 1 with starter gear and 50 gold';
                    break;

                case 'soft':
                    // Reset suave - nivel 1, sin items, pero mantiene gold
                    newCharacter = await createNewCharacter(targetUser.id, oldCharacter.class);
                    resetMessage = `**Soft Reset** - Back to level 1 but kept 🪙 ${oldGold} gold`;
                    break;

                case 'class':
                    // Solo cambio de clase - mantiene nivel y gold, cambia clase
                    const currentClass = oldCharacter.class;
                    const newClass = getOppositeClass(currentClass);
                    newCharacter = await changeCharacterClass(targetUser.id, oldCharacter, newClass);
                    resetMessage = `**Class Change** - Changed from ${currentClass} to ${newClass}, kept level ${oldCharacter.level} and 🪙 ${oldGold} gold`;
                    break;
            }

            const embed = new EmbedBuilder()
                .setTitle('🔄 Character Reset Successfully')
                .setColor(0x3498DB)
                .setDescription(`**${targetUser.username}'s** character has been reset!`)
                .addFields(
                    { name: '👤 Player', value: `${targetUser}`, inline: true },
                    { name: '🔄 Reset Type', value: resetMessage, inline: true },
                    { name: '👤 Reset By', value: `${interaction.user}`, inline: true }
                )
                .addFields(
                    { name: '📊 Before Reset', value: getCharacterSummary(oldCharacter, oldGold), inline: true },
                    { name: '📈 After Reset', value: getCharacterSummary(newCharacter, await Gold.getBalance(targetUser.id)), inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Notificar al usuario
            try {
                let userMessage = `🔄 Your character has been reset by an administrator!\n\n`;
                userMessage += `**Reset Type:** ${resetMessage}\n\n`;
                userMessage += `You can now use \`/rpg\` to see your new character!`;
                
                await targetUser.send({ content: userMessage });
            } catch (error) {
                console.log('Could not send DM to user');
            }

        } catch (error) {
            console.error('Error resetting character:', error);
            await interaction.reply({ 
                content: '❌ There was an error resetting the character.', 
                ephemeral: true 
            });
        }
    },
};

async function createNewCharacter(userId, className = null) {
    const baseStats = {
        mage: { 
            hp: 50, maxHp: 50, mp: 100, maxMp: 100, 
            attack: 5, defense: 3, magic: 15, agility: 6, intelligence: 12,
            class: 'mage', evolution: 'Apprentice'
        },
        warrior: { 
            hp: 100, maxHp: 100, mp: 30, maxMp: 30,
            attack: 12, defense: 10, magic: 2, agility: 4, strength: 14,
            class: 'warrior', evolution: 'Squire'
        },
        archer: { 
            hp: 70, maxHp: 70, mp: 60, maxMp: 60,
            attack: 10, defense: 5, magic: 4, agility: 12, dexterity: 13,
            class: 'archer', evolution: 'Hunter'
        }
    };

    // Si no se especifica clase, elegir una al azar
    const selectedClass = className || ['mage', 'warrior', 'archer'][Math.floor(Math.random() * 3)];

    const characterData = {
        ...baseStats[selectedClass],
        level: 1,
        exp: 0,
        maxExp: 100,
        inventory: [],
        equipped: {
            weapon: null,
            armor: null,
            accessory: null
        },
        skills: getStartingSkills(selectedClass),
        questsCompleted: 0,
        monstersDefeated: 0,
        createdAt: new Date()
    };

    await User.updateRPG(userId, characterData);
    return characterData;
}

async function changeCharacterClass(userId, oldCharacter, newClass) {
    const baseStats = {
        mage: { 
            magic: 15, intelligence: 12, maxMp: 100,
            class: 'mage', evolution: getEvolution(oldCharacter.level, 'mage')
        },
        warrior: { 
            attack: 12, defense: 10, strength: 14, maxHp: 100,
            class: 'warrior', evolution: getEvolution(oldCharacter.level, 'warrior')
        },
        archer: { 
            attack: 10, agility: 12, dexterity: 13,
            class: 'archer', evolution: getEvolution(oldCharacter.level, 'archer')
        }
    };

    const newCharacter = {
        ...oldCharacter,
        ...baseStats[newClass],
        skills: getStartingSkills(newClass).concat(getAdvancedSkills(oldCharacter.level, newClass))
    };

    await User.updateRPG(userId, newCharacter);
    return newCharacter;
}

function getStartingSkills(className) {
    const skills = {
        mage: ['Fireball', 'Magic Shield'],
        warrior: ['Power Strike', 'Taunt'],
        archer: ['Quick Shot', 'Dodge']
    };
    return skills[className] || [];
}

function getAdvancedSkills(level, className) {
    const skills = [];
    if (level >= 10) {
        if (className === 'mage') skills.push('Ice Blast');
        if (className === 'warrior') skills.push('Shield Bash');
        if (className === 'archer') skills.push('Poison Arrow');
    }
    if (level >= 20) {
        if (className === 'mage') skills.push('Lightning Strike');
        if (className === 'warrior') skills.push('Whirlwind');
        if (className === 'archer') skills.push('Multi-shot');
    }
    return skills;
}

function getEvolution(level, className) {
    if (level >= 80) {
        return className === 'mage' ? 'Mage Lord' : 
               className === 'warrior' ? 'War Lord' : 'Bow Master';
    } else if (level >= 50) {
        return className === 'mage' ? 'Archmage' : 
               className === 'warrior' ? 'Champion' : 'Sharpshooter';
    } else if (level >= 20) {
        return className === 'mage' ? 'Wizard' : 
               className === 'warrior' ? 'Knight' : 'Ranger';
    } else {
        return className === 'mage' ? 'Apprentice' : 
               className === 'warrior' ? 'Squire' : 'Hunter';
    }
}

function getOppositeClass(currentClass) {
    const classes = ['mage', 'warrior', 'archer'];
    return classes.filter(c => c !== currentClass)[Math.floor(Math.random() * 2)];
}

function getCharacterSummary(character, gold) {
    return `Level ${character.level} ${character.class}\n` +
           `EXP: ${character.exp}/${character.maxExp}\n` +
           `Gold: 🪙 ${gold}\n` +
           `Quests: ${character.questsCompleted || 0}`;
}