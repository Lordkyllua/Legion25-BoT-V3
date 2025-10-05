const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help_',
    
    async execute(interaction) {
        const category = interaction.customId.replace('help_', '');

        const helpPages = {
            rpg: {
                title: '🎮 RPG Guide',
                description: 'Complete guide to the RPG system',
                fields: [
                    { name: '🏹 Classes', value: '**Warrior** - High HP/Defense\n**Mage** - High Magic Damage\n**Archer** - High Agility/Crit' },
                    { name: '📈 Leveling', value: 'Gain EXP from quests and fights\nLevel up to increase stats\nEvolve at level 20 and 50' },
                    { name: '🎯 Evolution', value: 'Warrior → Knight → Paladin\nMage → Wizard → Archmage\nArcher → Ranger → Sniper' },
                    { name: '⚔️ Combat', value: 'Fight monsters for EXP and gold\nBattle bosses for rare rewards\nUse skills based on your class' }
                ]
            },
            economy: {
                title: '💰 Economy Guide',
                description: 'How to earn and spend gold',
                fields: [
                    { name: '💸 Earning Gold', value: 'Quests: 20-300 gold\nFights: 10-120 gold\nBosses: 300-500 gold\nCoinflip: High risk gambling' },
                    { name: '🛒 Spending Gold', value: 'Shop items\nEquipment upgrades\nPotions and consumables' },
                    { name: '📦 Inventory', value: 'Equip weapons and armor\nUse consumable items\nManage your gear' },
                    { name: '🏆 Rankings', value: 'Compete for top spots\nMultiple ranking categories\nServer leaderboards' }
                ]
            },
            classes: {
                title: '⚔️ Classes Info',
                description: 'Detailed class information',
                fields: [
                    { name: '⚔️ Warrior', value: '**Stats:** High STR/DEF\n**Role:** Tank/Damage\n**Skills:** Charge, Shield Bash, Whirlwind\n**Evolution:** Knight → Paladin' },
                    { name: '🔮 Mage', value: '**Stats:** High INT/MANA\n**Role:** Magic Damage\n**Skills:** Fireball, Heal, Meteor\n**Evolution:** Wizard → Archmage' },
                    { name: '🏹 Archer', value: '**Stats:** High AGI/CRIT\n**Role:** Ranged Damage\n**Skills:** Multi-shot, Dodge, Snipe\n**Evolution:** Ranger → Sniper' },
                    { name: '🔄 Resetting', value: 'Admins can reset classes\nUse `/reset player` command\nChoose reset type carefully' }
                ]
            },
            admin: {
                title: '⚙️ Admin Guide',
                description: 'Administrator commands and tools',
                fields: [
                    { name: '🎮 Player Management', value: '`/givegold` - Give gold to players\n`/giveexp` - Give experience points\n`/reset player` - Reset player data' },
                    { name: '🛒 Shop Management', value: '`/reset shop` - Update shop items\nReset with default or advanced items\nClear all items if needed' },
                    { name: '🛡️ Moderation', value: '`/warn` - Warn users\n`/warnings` - View warnings\n`/mute` - Timeout users\n`/roleadmin` - Manage roles' },
                    { name: '📊 Reset Types', value: '**Class Reset** - Reset class only\n**Level Reset** - Reset level only\n**Full Reset** - Delete all player data' }
                ]
            }
        };

        const page = helpPages[category];
        if (!page) return;

        const embed = new EmbedBuilder()
            .setTitle(page.title)
            .setDescription(page.description)
            .setColor(0x00AE86)
            .addFields(...page.fields)
            .setFooter({ text: 'Micro Hunter RPG - Developed by LordK' });

        await interaction.update({ embeds: [embed] });
    }
};