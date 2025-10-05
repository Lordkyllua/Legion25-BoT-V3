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
                    { name: '🎯 Evolution', value: 'Warrior → Knight → Paladin\nMage → Wizard → Archmage\nArcher → Ranger → Sniper' }
                ]
            },
            economy: {
                title: '💰 Economy Guide',
                description: 'How to earn and spend gold',
                fields: [
                    { name: '💸 Earning Gold', value: 'Quests: 20-300 gold\nFights: 10-120 gold\nBosses: 300-500 gold' },
                    { name: '🛒 Spending Gold', value: 'Shop items\nEquipment upgrades\nPotions and consumables' },
                    { name: '🎲 Gambling', value: 'Coin flip: Double or nothing\nHigh risk, high reward' }
                ]
            },
            classes: {
                title: '⚔️ Classes Info',
                description: 'Detailed class information',
                fields: [
                    { name: '⚔️ Warrior', value: '**Stats:** High STR/DEF\n**Role:** Tank/Damage\n**Skills:** Charge, Shield Bash' },
                    { name: '🔮 Mage', value: '**Stats:** High INT/MANA\n**Role:** Magic Damage\n**Skills:** Fireball, Heal' },
                    { name: '🏹 Archer', value: '**Stats:** High AGI/CRIT\n**Role:** Ranged Damage\n**Skills:** Multi-shot, Dodge' }
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