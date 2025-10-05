const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('Micro Hunter RPG system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start your RPG journey'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('profile')
                .setDescription('Check your RPG profile'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('class')
                .setDescription('Choose your RPG class')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'start') {
            await handleStart(interaction);
        } else if (subcommand === 'profile') {
            await handleProfile(interaction);
        } else if (subcommand === 'class') {
            await handleClass(interaction);
        }
    }
};

async function handleStart(interaction) {
    let user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
    
    if (user) {
        return await interaction.reply({ 
            content: '🎮 You have already started your RPG journey! Use `/rpg profile` to check your stats.', 
            ephemeral: true 
        });
    }

    user = new User({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
        username: interaction.user.username
    });

    await user.save();

    const embed = new EmbedBuilder()
        .setTitle('🎮 Welcome to Micro Hunter RPG!')
        .setDescription('Your adventure begins now! Choose your class and start your journey to become the strongest hunter.')
        .setColor(0x00AE86)
        .addFields(
            { name: '🏹 Classes Available', value: '**Warrior** - Master of strength and defense\n**Mage** - Weaver of powerful magic\n**Archer** - Agile ranged combatant' },
            { name: '📈 Progression', value: '• Level up to 100\n• Evolve your class twice\n• Defeat monsters and bosses\n• Complete challenging quests' },
            { name: '🎯 Getting Started', value: 'Use `/rpg class` to choose your class\nUse `/quest` to start earning rewards\nUse `/fight` to battle monsters' }
        )
        .setFooter({ text: 'Developed by LordK - Inspired by Micro Hunter' });

    await interaction.reply({ embeds: [embed] });
}

async function handleProfile(interaction) {
    const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
    
    if (!user) {
        return await interaction.reply({ 
            content: '❌ You need to start your RPG journey first! Use `/rpg start`', 
            ephemeral: true 
        });
    }

    const expNeeded = user.level * 100;
    const progress = (user.exp / expNeeded) * 100;
    const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

    const embed = new EmbedBuilder()
        .setTitle(`🎮 ${interaction.user.username}'s RPG Profile`)
        .setColor(0x00AE86)
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
            { name: '📊 Level', value: `**${user.level}**`, inline: true },
            { name: '🎯 Class', value: `**${user.class}**`, inline: true },
            { name: '⭐ Evolution', value: `**${user.evolution}**`, inline: true },
            { name: '💫 Experience', value: `${user.exp}/${expNeeded} XP\n${progressBar} ${progress.toFixed(1)}%`, inline: false },
            { name: '💰 Gold', value: `**${user.gold}** 🪙`, inline: true },
            { name: '❤️ Health', value: `**${user.health}/${user.maxHealth}** ❤️`, inline: true },
            { name: '🔷 Mana', value: `**${user.mana}/${user.maxMana}** 💧`, inline: true }
        )
        .addFields(
            { name: '💪 Strength', value: `**${user.strength}**`, inline: true },
            { name: '🧠 Intelligence', value: `**${user.intelligence}**`, inline: true },
            { name: '⚡ Agility', value: `**${user.agility}**`, inline: true },
            { name: '🛡️ Defense', value: `**${user.defense}**`, inline: true }
        )
        .addFields(
            { name: '🏆 Achievements', value: `Monsters Defeated: **${user.monstersDefeated}**\nBosses Defeated: **${user.bossesDefeated}**`, inline: false }
        )
        .setFooter({ text: 'Micro Hunter RPG - Developed by LordK' });

    await interaction.reply({ embeds: [embed] });
}

async function handleClass(interaction) {
    const user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
    
    if (!user) {
        return await interaction.reply({ 
            content: '❌ You need to start your RPG journey first! Use `/rpg start`', 
            ephemeral: true 
        });
    }

    if (user.class !== 'Novice') {
        return await interaction.reply({ 
            content: `❌ You are already a **${user.class}**! Evolution available at level 20 and 50.`, 
            ephemeral: true 
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('🏹 Choose Your Class')
        .setDescription('Select your path to become a legendary hunter! Each class has unique strengths and evolution paths.')
        .setColor(0x00AE86)
        .addFields(
            {
                name: '⚔️ Warrior',
                value: '**Strengths:** High HP, Defense, and Strength\n**Evolutions:** Knight → Paladin\n**Playstyle:** Tank and melee damage dealer'
            },
            {
                name: '🔮 Mage',
                value: '**Strengths:** High Intelligence, Mana, and Magic Damage\n**Evolutions:** Wizard → Archmage\n**Playstyle:** Ranged magic damage and support'
            },
            {
                name: '🏹 Archer',
                value: '**Strengths:** High Agility, Critical Chance, and Accuracy\n**Evolutions:** Ranger → Sniper\n**Playstyle:** Ranged physical damage and mobility'
            }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('class_selection')
                .setPlaceholder('Choose your class...')
                .addOptions([
                    {
                        label: 'Warrior',
                        description: 'Master of strength and defense',
                        value: 'warrior',
                        emoji: '⚔️'
                    },
                    {
                        label: 'Mage',
                        description: 'Weaver of powerful magic',
                        value: 'mage',
                        emoji: '🔮'
                    },
                    {
                        label: 'Archer',
                        description: 'Agile ranged combatant',
                        value: 'archer',
                        emoji: '🏹'
                    }
                ])
        );

    await interaction.reply({ embeds: [embed], components: [row] });
}const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Player } = require('../models/Player');
const RPGUtils = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('Crear o ver tu personaje RPG'),
    
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const userId = interaction.user.id;

            // Buscar o crear jugador
            let player = await Player.findOne({ userId });
            const isNew = !player;
            
            if (!player) {
                player = await RPGUtils.createCharacter(userId, interaction.user.username);
            }

            const rpgEmbed = new EmbedBuilder()
                .setTitle(isNew ? '🎮 ¡Personaje Creado!' : '👤 Tu Personaje RPG')
                .setDescription(isNew ? 
                    `¡Bienvenido al mundo RPG, ${interaction.user.username}!` : 
                    `Estadísticas de ${interaction.user.username}`)
                .addFields(
                    { name: '👤 Nombre', value: player.username, inline: true },
                    { name: '⚔️ Clase', value: player.class, inline: true },
                    { name: '⭐ Nivel', value: `Nivel ${player.level}`, inline: true },
                    { name: '❤️ HP', value: `${player.currentHp}/${player.hp}`, inline: true },
                    { name: '🔵 MP', value: `${player.currentMp}/${player.mp}`, inline: true },
                    { name: '📊 EXP', value: `${player.exp}/${player.maxExp}`, inline: true },
                    { name: '💪 Fuerza', value: player.strength.toString(), inline: true },
                    { name: '🛡️ Defensa', value: player.defense.toString(), inline: true },
                    { name: '🔮 Magia', value: player.magic.toString(), inline: true },
                    { name: '⚡ Agilidad', value: player.agility.toString(), inline: true },
                    { name: '💰 Oro', value: (player.gold || 0).toString(), inline: true },
                    { name: '🏆 Evolución', value: player.evolution, inline: true }
                )
                .setColor(0x0099FF)
                .setTimestamp()
                .setFooter({ 
                    text: `Misiones: ${player.questsCompleted || 0} | Monstruos: ${player.monstersDefeated || 0}` 
                });

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('rpg_inventory')
                    .setLabel('🎒 Inventario')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('rpg_skills')
                    .setLabel('✨ Habilidades')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('rpg_quests')
                    .setLabel('🏹 Misiones')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({
                embeds: [rpgEmbed],
                components: [buttons]
            });

        } catch (error) {
            console.error('Error in rpg command:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al crear/ver tu personaje. Por favor, intenta nuevamente.',
                components: []
            });
        }
    }
};