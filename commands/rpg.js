const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('View your RPG character profile'),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            
            // Usar la función corregida
            const userProfile = rpgUtil.getUserProfile(userId);
            
            const progressPercent = Math.round((userProfile.exp / userProfile.expToNextLevel) * 100);
            const progressBar = '█'.repeat(Math.floor(progressPercent / 10)) + '░'.repeat(10 - Math.floor(progressPercent / 10));
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`⚔️ ${interaction.user.username}'s Profile`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(userProfile.class ? 
                    `**${userProfile.className}** level ${userProfile.level}` : 
                    '**Apprentice** - Use `/class` to choose your class!')
                .addFields(
                    {
                        name: '📊 Level and Experience',
                        value: `**Level:** ${userProfile.level}\n**EXP:** ${userProfile.exp}/${userProfile.expToNextLevel}\n**Progress:** ${progressBar} ${progressPercent}%`,
                        inline: false
                    },
                    {
                        name: '❤️ Main Attributes',
                        value: `**Health:** ${userProfile.health}/${userProfile.maxHealth}\n**Mana:** ${userProfile.mana}/${userProfile.maxMana}\n**Gold:** ${userProfile.gold} 🥇`,
                        inline: true
                    },
                    {
                        name: '🎯 Statistics',
                        value: `⚔️ Attack: ${userProfile.stats.attack}\n🛡️ Defense: ${userProfile.stats.defense}\n🔮 Magic: ${userProfile.stats.magic}\n🎯 Agility: ${userProfile.stats.agility}`,
                        inline: true
                    }
                );
            
            if (userProfile.class) {
                embed.addFields({
                    name: '⚡ Skills',
                    value: userProfile.skills.map(skill => `• ${skill}`).join('\n') || 'No skills',
                    inline: false
                });
            }
            
            embed.addFields({
                name: '🎽 Equipment',
                value: `**Weapon:** ${userProfile.equipment.weapon}\n**Armor:** ${userProfile.equipment.armor}\n**Accessory:** ${userProfile.equipment.accessory}`,
                inline: false
            });
            
            if (userProfile.evolution) {
                embed.addFields({
                    name: '✨ Evolution',
                    value: `**${userProfile.evolution}** (Level ${userProfile.evolutionLevel}+)`,
                    inline: true
                });
            }
            
            embed.setFooter({ 
                text: `Developed by LordK • ${userProfile.inventory ? `Items: ${userProfile.inventory.length}` : 'Empty inventory'}`, 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in RPG command:', error);
            await interaction.reply({
                content: '❌ Error loading your RPG profile. Try again later.',
                ephemeral: true
            });
        }
    }
};