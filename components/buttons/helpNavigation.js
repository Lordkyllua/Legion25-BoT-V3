const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'help_',
    async execute(interaction) {
        if (interaction.customId === 'help_rpg') {
            const embed = new EmbedBuilder()
                .setTitle('⚔️ RPG System Guide')
                .setColor(0xE74C3C)
                .addFields(
                    { name: 'Classes', value: '• **Mage**: Powerful magic, low defense\n• **Warrior**: High HP and defense\n• **Archer**: Balanced stats with ranged attacks' },
                    { name: 'Leveling', value: 'Gain experience through quests and battles. Max level is 100.' },
                    { name: 'Items', value: 'Equip weapons, armor, and accessories to boost your stats.' },
                    { name: 'Commands', value: '`/rpg` - Character info\n`/quest` - Start quests\n`/fight` - Battle players' }
                );

            await interaction.update({ embeds: [embed] });
        } else if (interaction.customId === 'help_shop') {
            const embed = new EmbedBuilder()
                .setTitle('🛒 Shop System Guide')
                .setColor(0x3498DB)
                .addFields(
                    { name: 'Currency', value: 'Earn gold through games, quests, and activities' },
                    { name: 'Items', value: 'Weapons, armor, and consumables available' },
                    { name: 'Class Items', value: 'Some items are class-specific' },
                    { name: 'Level Requirements', value: 'Higher level items require higher character level' },
                    { name: 'Commands', value: '`/shop` - Browse items\n`/buy` - Purchase items\n`/inventory` - View your items' }
                );

            await interaction.update({ embeds: [embed] });
        } else if (interaction.customId === 'help_quests') {
            const embed = new EmbedBuilder()
                .setTitle('🏹 Quest System Guide')
                .setColor(0xF39C12)
                .addFields(
                    { name: 'Quest Types', value: '• Easy: Low risk, low reward\n• Medium: Balanced challenge\n• Hard: High risk, high reward' },
                    { name: 'Rewards', value: 'Earn experience points and gold' },
                    { name: 'Success Chance', value: 'Higher level characters have better success rates' },
                    { name: 'Commands', value: '`/quest` - Start a quest\n`/rpg` - Check your level' }
                );

            await interaction.update({ embeds: [embed] });
        }
    },
};