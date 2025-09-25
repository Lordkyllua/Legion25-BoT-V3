const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('View your RPG character profile'),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            
            // Use the function directly from the imported module
            const userProfile = rpgUtil.getUserProfile(userId);
            
            // Calculate progress
            const progressPercent = Math.round((userProfile.exp / userProfile.expToNextLevel) * 100);
            const progressBar = '█'.repeat(Math.floor(progressPercent / 10)) + '░'.repeat(10 - Math.floor(progressPercent / 10));
            
            // Create embed
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`⚔️ ${interaction.user.username}'s Character Profile`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(userProfile.class ? 
                    `**${userProfile.className}** - Level ${userProfile.level}` : 
                    '**Apprentice** - Use `/class` to choose your class!')
                .addFields(
                    {
                        name: '📊 Level & Progress',
                        value: `**Level:** ${userProfile.level}\n**EXP:** ${userProfile.exp}/${userProfile.expToNextLevel}\n**Progress:** ${progressBar} ${progressPercent}%`,
                        inline: false
                    },
                    {
                        name: '❤️ Attributes',
                        value: `**Health:** ${userProfile.health}/${userProfile.maxHealth}\n**Mana:** ${userProfile.mana}/${userProfile.maxMana}\n**Gold:** ${userProfile.gold} 🥇`,
                        inline: true
                    },
                    {
                        name: '🎯 Stats',
                        value: `⚔️ Attack: ${userProfile.stats.attack}\n🛡️ Defense: ${userProfile.stats.defense}\n🔮 Magic: ${userProfile.stats.magic}\n🎯 Agility: ${userProfile.stats.agility}`,
                        inline: true
                    }
                );
            
            // Add skills if available
            if (userProfile.skills && userProfile.skills.length > 0) {
                embed.addFields({
                    name: '⚡ Skills',
                    value: userProfile.skills.map(skill => `• ${skill}`).join('\n'),
                    inline: false
                });
            }
            
            // Add equipment
            embed.addFields({
                name: '🎽 Equipment',
                value: `**Weapon:** ${userProfile.equipment.weapon}\n**Armor:** ${userProfile.equipment.armor}\n**Accessory:** ${userProfile.equipment.accessory}`,
                inline: false
            });
            
            // Add evolution info if available
            if (userProfile.evolution) {
                embed.addFields({
                    name: '✨ Evolution',
                    value: `**${userProfile.evolution}** (Level ${userProfile.evolutionLevel}+)`,
                    inline: true
                });
            }
            
            embed.setFooter({ 
                text: `Developed by LordK • Inventory: ${userProfile.inventory ? userProfile.inventory.length : 0} items`, 
                iconURL: interaction.client.user.displayAvatarURL() 
            });

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in RPG command:', error);
            await interaction.reply({
                content: '❌ Error loading your character profile. Please try again.',
                ephemeral: true
            });
        }
    }
};