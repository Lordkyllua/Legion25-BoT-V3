const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'help_',
    async execute(interaction) {
        if (interaction.customId === 'help_rpg') {
            const embed = new EmbedBuilder()
                .setTitle('⚔️ RPG System Guide')
                .setColor(0xE74C3C)
                .setDescription('Complete guide to the RPG system and character progression')
                .addFields(
                    { 
                        name: '🎮 Getting Started', 
                        value: 'Use `/rpg` to create your character and choose from three classes:\n• **🔮 Mage**: High magic power, powerful spells\n• **⚔️ Warrior**: High HP and defense, strong attacks\n• **🏹 Archer**: Balanced stats, ranged superiority',
                        inline: false 
                    },
                    { 
                        name: '📈 Leveling System', 
                        value: '• **Max Level**: 100\n• **Experience**: Gain from quests and battles\n• **Evolutions**: Unlock at levels 20, 50, and 80\n• **Stat Growth**: Automatic stat increases on level up',
                        inline: false 
                    },
                    { 
                        name: '🎒 Inventory & Equipment', 
                        value: '• Use `/inventory` to view your items\n• Equip weapons, armor, and accessories\n• Items provide stat bonuses\n• Class-specific items available',
                        inline: false 
                    },
                    { 
                        name: '🛠️ Available Commands', 
                        value: '```/rpg - Character management\n/inventory - View and manage items\n/quest - Start adventures\n/fight - Battle other players (Coming Soon)```',
                        inline: false 
                    },
                    { 
                        name: '🌟 Progression Tips', 
                        value: '1. Start with easy quests to build your character\n2. Equip the best items for your class\n3. Complete daily quests for consistent rewards\n4. Level up to unlock new skills and evolutions',
                        inline: false 
                    }
                )
                .setFooter({ text: 'Your adventure awaits! Start with /rpg' });

            await interaction.update({ embeds: [embed] });

        } else if (interaction.customId === 'help_shop') {
            const embed = new EmbedBuilder()
                .setTitle('🛒 Shop System Guide')
                .setColor(0x3498DB)
                .setDescription('Complete guide to the in-game shop and economy')
                .addFields(
                    { 
                        name: '💰 Currency System', 
                        value: '**Gold (🪙)** is the main currency:\n• Quest completions\n• Coin flip games\n• Level up rewards\n• Admin gifts',
                        inline: false 
                    },
                    { 
                        name: '🏪 Shop Categories', 
                        value: '• **⚔️ Weapons**: Class-specific damage items\n• **🛡️ Armor**: Class-specific defense items\n• **💎 Accessories**: Special bonus items\n• **🧪 Potions**: Health and mana restoration\n• **📦 Consumables**: One-time use items',
                        inline: false 
                    },
                    { 
                        name: '🛒 How to Buy', 
                        value: '1. Use `/shop` to browse items\n2. Note the **Item ID** next to each item\n3. Use `/buy <item_id>` to purchase\n4. Check `/inventory` to see your new items',
                        inline: false 
                    },
                    { 
                        name: '📋 Purchase Requirements', 
                        value: '• **Gold**: Must have enough gold\n• **Level**: Meet minimum level requirement\n• **Class**: Some items are class-specific\n• **Type**: Items marked "all" can be used by any class',
                        inline: false 
                    },
                    { 
                        name: '🛠️ Available Commands', 
                        value: '```/shop - Browse available items\n/buy - Purchase items\n/inventory - View purchased items```',
                        inline: false 
                    }
                )
                .setFooter({ text: 'Build your perfect gear set!' });

            await interaction.update({ embeds: [embed] });

        } else if (interaction.customId === 'help_quests') {
            const embed = new EmbedBuilder()
                .setTitle('🏹 Quest System Guide')
                .setColor(0xF39C12)
                .setDescription('Complete guide to quests and adventures')
                .addFields(
                    { 
                        name: '🎯 Quest Types', 
                        value: '• **🟢 Easy Quests**: Low risk, good for beginners\n• **🟡 Medium Quests**: Balanced challenge and rewards\n• **🔴 Hard Quests**: High risk, best for experienced players',
                        inline: false 
                    },
                    { 
                        name: '🏆 Rewards', 
                        value: '**Successful Quests:**\n• Experience points (⭐)\n• Gold coins (🪙)\n• Quest completion count\n\n**Failed Quests:**\n• No penalties\n• Can retry immediately',
                        inline: false 
                    },
                    { 
                        name: '📊 Success Rates', 
                        value: '• **Easy**: 80% success chance\n• **Medium**: 60% success chance\n• **Hard**: 40% success chance\n\n*Higher level characters have better chances*',
                        inline: false 
                    },
                    { 
                        name: '🎮 How to Start', 
                        value: '1. Use `/quest` to get a random quest\n2. Check the difficulty and rewards\n3. Click "Start Quest" to begin\n4. Wait for the outcome (instant)\n5. Receive rewards if successful',
                        inline: false 
                    },
                    { 
                        name: '💡 Quest Tips', 
                        value: '• Start with easy quests to build experience\n• Level up your character for better success rates\n• Complete multiple quests for achievement rewards\n• Check your progress with the quest log in `/rpg`',
                        inline: false 
                    },
                    { 
                        name: '🛠️ Available Commands', 
                        value: '```/quest - Start a new quest\n/rpg - Check quest statistics and achievements```',
                        inline: false 
                    }
                )
                .setFooter({ text: 'Adventure awaits! Every quest tells a story.' });

            await interaction.update({ embeds: [embed] });

        } else if (interaction.customId === 'help_admin') {
            const embed = new EmbedBuilder()
                .setTitle('🛡️ Administration Guide')
                .setColor(0x9B59B6)
                .setDescription('Guide for server administrators and moderators')
                .addFields(
                    { 
                        name: '👑 Administrator Commands', 
                        value: '```/roleadmin - Manage selectable roles for users\n/warn - Issue warnings to users\n/warnings - Check user warning history\n/mute - Temporarily mute users\n/givegold - Give gold to users\n/giveexp - Give experience to users```',
                        inline: false 
                    },
                    { 
                        name: '💰 Economy Management', 
                        value: '**/givegold <user> <amount>**\n• Give gold to any user\n• Amount: 1 - 1,000,000\n• User receives notification\n\n**/giveexp <user> <amount>**\n• Give experience to any user\n• Amount: 1 - 100,000\n• Can trigger level ups\n• User receives notification',
                        inline: false 
                    },
                    { 
                        name: '🛡️ Moderation Tools', 
                        value: '**/warn <user> <reason>**\n• Issue formal warnings\n• Tracks warning history\n• Sends DM to user\n\n**/mute <user> <duration> <reason>**\n• Temporary mute functionality\n• Duration in minutes\n• Requires proper bot permissions',
                        inline: false 
                    },
                    { 
                        name: '🎭 Role Management', 
                        value: '**/roleadmin**\n• Set which roles users can self-assign\n• Interactive role selection\n• Save configuration automatically',
                        inline: false 
                    },
                    { 
                        name: '📊 Permission Requirements', 
                        value: '• **Administrator** or **Manage Roles** permission\n• Bot role must be above assigned roles\n• Proper channel permissions for command usage',
                        inline: false 
                    },
                    { 
                        name: '💡 Best Practices', 
                        value: '• Use economy commands for events and rewards\n• Document warnings with clear reasons\n• Set appropriate role hierarchies\n• Test commands in a private channel first',
                        inline: false 
                    }
                )
                .setFooter({ text: 'Responsible administration creates a better community' });

            await interaction.update({ embeds: [embed] });
        }
    },
};