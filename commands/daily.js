const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rpgUtil = require('../utils/rpg');
const pointsUtil = require('../utils/points');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const now = new Date();
            const today = now.toDateString();
            
            // Obtener perfil del usuario
            const profile = rpgUtil.getUserProfile(userId);
            
            // Verificar si ya reclamó hoy
            if (profile.lastDaily === today) {
                const nextDaily = new Date(now);
                nextDaily.setDate(nextDaily.getDate() + 1);
                nextDaily.setHours(0, 0, 0, 0);
                
                const timeLeft = nextDaily - now;
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                
                const embed = new EmbedBuilder()
                    .setColor(0xffa500)
                    .setTitle('⏰ Daily Reward Already Claimed')
                    .setDescription('You have already claimed your daily reward today!')
                    .addFields({
                        name: '🕒 Next Daily Reward In',
                        value: `${hoursLeft}h ${minutesLeft}m`
                    })
                    .setFooter({ 
                        text: 'Come back tomorrow for more rewards! • Developed by LordK',
                        iconURL: interaction.client.user.displayAvatarURL()
                    });

                return await interaction.reply({ embeds: [embed] });
            }
            
            // Calcular recompensas basadas en nivel y streak
            const streak = profile.dailyStreak || 0;
            const newStreak = streak + 1;
            
            let goldReward = 50 + (profile.level * 5) + (newStreak * 10);
            let expReward = 25 + (profile.level * 2) + (newStreak * 5);
            let pointsReward = 10 + Math.floor(newStreak / 3);
            
            // Bonus por streak
            if (newStreak % 7 === 0) {
                goldReward *= 2;
                expReward *= 2;
                pointsReward *= 2;
            }
            
            // Aplicar recompensas
            rpgUtil.addGold(userId, goldReward);
            rpgUtil.addExperience(userId, expReward);
            pointsUtil.addPoints(userId, pointsReward);
            
            // Actualizar datos diarios
            profile.lastDaily = today;
            profile.dailyStreak = newStreak;
            
            // Guardar cambios
            const databasePath = './database.json';
            const databaseData = require('fs').existsSync(databasePath) ? 
                require('fs').readFileSync(databasePath, 'utf8') : '{"users": {}}';
            const database = JSON.parse(databaseData);
            
            if (!database.users) database.users = {};
            database.users[userId] = { rpg: profile };
            require('fs').writeFileSync(databasePath, JSON.stringify(database, null, 2));
            
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('🎁 Daily Reward Claimed!')
                .setDescription(`Here are your daily rewards for today!`)
                .addFields(
                    {
                        name: '💰 Gold',
                        value: `**+${goldReward}** 🥇`,
                        inline: true
                    },
                    {
                        name: '⭐ EXP',
                        value: `**+${expReward}** ⭐`,
                        inline: true
                    },
                    {
                        name: '🎯 Points',
                        value: `**+${pointsReward}** 🎯`,
                        inline: true
                    },
                    {
                        name: '🔥 Streak',
                        value: `**${newStreak} days** in a row!`,
                        inline: false
                    }
                );
            
            // Mensaje especial por streak
            if (newStreak % 7 === 0) {
                embed.addFields({
                    name: '🎉 7-Day Streak Bonus!',
                    value: 'You received double rewards for your 7-day streak!',
                    inline: false
                });
            }
            
            embed.setFooter({ 
                text: `Come back tomorrow for more! • Current streak: ${newStreak} days • Developed by LordK`,
                iconURL: interaction.client.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in daily command:', error);
            await interaction.reply({
                content: '❌ Error claiming daily reward. Please try again later.',
                ephemeral: true
            });
        }
    }
};