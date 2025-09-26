const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('train')
        .setDescription('Train your skills to become stronger')
        .addStringOption(option =>
            option.setName('skill')
                .setDescription('Choose which skill to train')
                .setRequired(true)
                .addChoices(
                    { name: '⚔️ Attack', value: 'attack' },
                    { name: '🛡️ Defense', value: 'defense' },
                    { name: '🔮 Magic', value: 'magic' },
                    { name: '🎯 Agility', value: 'agility' }
                )),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const skill = interaction.options.getString('skill');
            const profile = rpgUtil.getUserProfile(userId);
            
            // Verificar si tiene clase
            if (!profile.class) {
                return await interaction.reply({
                    content: '❌ You need to choose a class first with `/class`!',
                    ephemeral: true
                });
            }
            
            // Costo de entrenamiento basado en nivel
            const trainCost = Math.floor(10 + (profile.level * 2));
            
            if (profile.gold < trainCost) {
                return await interaction.reply({
                    content: `❌ You need ${trainCost} gold to train! You have ${profile.gold} gold.`,
                    ephemeral: true
                });
            }
            
            // Calcular mejora basada en nivel y suerte
            const baseImprovement = 1 + Math.floor(profile.level / 10);
            const randomBonus = Math.floor(Math.random() * 3);
            const totalImprovement = baseImprovement + randomBonus;
            
            // Aplicar mejora
            profile.stats[skill] += totalImprovement;
            profile.gold -= trainCost;
            
            // Guardar cambios
            const databasePath = './database.json';
            const databaseData = require('fs').existsSync(databasePath) ? 
                require('fs').readFileSync(databasePath, 'utf8') : '{"users": {}}';
            const database = JSON.parse(databaseData);
            
            if (!database.users) database.users = {};
            database.users[userId] = { rpg: profile };
            require('fs').writeFileSync(databasePath, JSON.stringify(database, null, 2));
            
            const skillNames = {
                attack: '⚔️ Attack',
                defense: '🛡️ Defense', 
                magic: '🔮 Magic',
                agility: '🎯 Agility'
            };
            
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('💪 Training Complete!')
                .setDescription(`You trained your **${skillNames[skill]}** skill!`)
                .addFields(
                    {
                        name: '📈 Improvement',
                        value: `**+${totalImprovement}** ${skillNames[skill]}`,
                        inline: true
                    },
                    {
                        name: '💰 Cost',
                        value: `**${trainCost}** gold`,
                        inline: true
                    },
                    {
                        name: '🎯 New Stat',
                        value: `**${profile.stats[skill]}** ${skillNames[skill]}`,
                        inline: true
                    }
                )
                .setFooter({ 
                    text: `Keep training to become stronger! • Developed by LordK`,
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in train command:', error);
            await interaction.reply({
                content: '❌ Error during training. Please try again later.',
                ephemeral: true
            });
        }
    }
};