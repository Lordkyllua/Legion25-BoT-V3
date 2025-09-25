const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('class')
        .setDescription('Choose your RPG class: Warrior, Mage or Archer'),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const profile = rpgUtil.getUserProfile(userId);
            
            // Verificar si ya tiene clase
            if (profile.class) {
                const classInfo = rpgUtil.classes[profile.class];
                const embed = new EmbedBuilder()
                    .setColor(0xFF6B00)
                    .setTitle('🎯 You already have a class!')
                    .setDescription(`You are already a **${profile.className}** (${profile.class}).`)
                    .addFields(
                        {
                            name: '📊 Your Statistics',
                            value: `❤️ Health: ${profile.health}/${profile.maxHealth}\n⚔️ Attack: ${profile.stats.attack}\n🛡️ Defense: ${profile.stats.defense}\n🔮 Magic: ${profile.stats.magic}\n🎯 Agility: ${profile.stats.agility}`
                        },
                        {
                            name: '⚡ Your Skills',
                            value: profile.skills.map(skill => `• ${skill}`).join('\n') || 'No skills yet'
                        }
                    )
                    .setFooter({ 
                        text: 'You cannot change your class once chosen • Developed by LordK',
                        iconURL: interaction.user.displayAvatarURL()
                    });

                return await interaction.reply({ embeds: [embed] });
            }
            
            // Mostrar opciones de clase con botones que funcionen
            const classEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('🎮 Choose Your Destiny')
                .setDescription('**Your class defines your playstyle and abilities. Choose wisely!**\n\nThis decision is permanent and will shape your entire adventure.')
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    {
                        name: '⚔️ WARRIOR',
                        value: '**The Melee Specialist**\n• High health and defense\n• Powerful physical attacks\n• Excellent for beginners\n• Great survivability',
                        inline: true
                    },
                    {
                        name: '🔮 MAGE',
                        value: '**The Spellcasting Master**\n• Devastating magical damage\n• Area effect spells\n• Strategic gameplay\n• High damage potential',
                        inline: true
                    },
                    {
                        name: '🏹 ARCHER',
                        value: '**The Ranged Expert**\n• High agility and precision\n• Ranged attacks\n• Great mobility\n• Critical hit specialist',
                        inline: true
                    },
                    {
                        name: '📈 Base Statistics Comparison',
                        value: '```\nWarrior:  ❤️150  ⚔️20  🛡️15  🔮5   🎯8\nMage:     ❤️100  ⚔️8   🛡️8   🔮25  🎯10\nArcher:   ❤️120  ⚔️18  🛡️10  🔮8   🎯20```',
                        inline: false
                    },
                    {
                        name: '💡 Recommendation',
                        value: '• **New players**: Start with Warrior for easier survival\n• **Strategic players**: Choose Mage for spell variety\n• **Mobile players**: Pick Archer for hit-and-run tactics',
                        inline: false
                    }
                )
                .setFooter({ 
                    text: 'Click a button below to choose your class • This choice is permanent! • Developed by LordK',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            // Crear botones con customIds únicos y correctos
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('class_warrior')
                        .setLabel('⚔️ Choose Warrior')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('⚔️'),
                    new ButtonBuilder()
                        .setCustomId('class_mage')
                        .setLabel('🔮 Choose Mage')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🔮'),
                    new ButtonBuilder()
                        .setCustomId('class_archer')
                        .setLabel('🏹 Choose Archer')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🏹')
                );

            await interaction.reply({ 
                embeds: [classEmbed], 
                components: [row] 
            });
            
        } catch (error) {
            console.error('Error in class command:', error);
            await interaction.reply({
                content: '❌ Error showing class selection. Please try again later.',
                ephemeral: true
            });
        }
    }
};