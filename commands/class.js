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
            
            if (profile.class) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF6B00)
                    .setTitle('🎯 You already have a class')
                    .setDescription(`You are already a **${profile.className}**. You cannot change your class.`)
                    .addFields(
                        {
                            name: 'Your Statistics',
                            value: `❤️ Health: ${profile.health}/${profile.maxHealth}\n⚔️ Attack: ${profile.stats.attack}\n🛡️ Defense: ${profile.stats.defense}\n🔮 Magic: ${profile.stats.magic}\n🎯 Agility: ${profile.stats.agility}`
                        }
                    )
                    .setFooter({ text: 'Developed by LordK • RPG System' });

                return await interaction.reply({ embeds: [embed] });
            }
            
            const classEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('🎮 Choose your Class')
                .setDescription('Your class will define your playstyle and abilities. Choose wisely!')
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    {
                        name: '⚔️ Warrior',
                        value: '**Description:** Melee fighter with high resistance\n**Stats:** ❤️ High health, ⚔️ High attack, 🛡️ Good defense\n**Skills:** Powerful strikes and defensive abilities',
                        inline: false
                    },
                    {
                        name: '🔮 Mage',
                        value: '**Description:** Spellcaster with devastating magical damage\n**Stats:** 🔮 High magic, 🎯 Good agility\n**Skills:** Elemental spells and battle control',
                        inline: false
                    },
                    {
                        name: '🏹 Archer',
                        value: '**Description:** Precise shooter with high mobility\n**Stats:** 🎯 High agility, ⚔️ Good attack\n**Skills:** Ranged attacks and evasion abilities',
                        inline: false
                    }
                )
                .setFooter({ text: 'Developed by LordK • Each class has unique skills that unlock as you level up' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('choose_warrior')
                        .setLabel('⚔️ Warrior')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('choose_mage')
                        .setLabel('🔮 Mage')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('choose_archer')
                        .setLabel('🏹 Archer')
                        .setStyle(ButtonStyle.Success)
                );

            await interaction.reply({ 
                embeds: [classEmbed], 
                components: [row] 
            });
            
        } catch (error) {
            console.error('Error in class command:', error);
            await interaction.reply({
                content: '❌ Error showing classes. Try again later.',
                ephemeral: true
            });
        }
    }
};