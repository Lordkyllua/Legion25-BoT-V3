async function addExperience(userId, exp, interaction = null) {
    console.log(`📊 Adding ${exp} EXP to user ${userId}`);
    
    const user = await User.findById(userId);
    if (!user || !user.rpg) {
        console.log('❌ User or RPG data not found');
        return null;
    }

    const rpg = user.rpg;
    const oldLevel = rpg.level;
    console.log(`📈 Before: Level ${oldLevel}, EXP: ${rpg.exp}/${rpg.maxExp}`);
    
    rpg.exp += exp;
    
    let levelsGained = 0;
    let levelUpData = null;
    
    // Check for level up
    while (rpg.exp >= rpg.maxExp && rpg.level < 100) {
        rpg.exp -= rpg.maxExp;
        rpg.level += 1;
        levelsGained++;
        rpg.maxExp = Math.floor(rpg.maxExp * 1.2);
        
        console.log(`🎉 Level up! New level: ${rpg.level}, EXP: ${rpg.exp}/${rpg.maxExp}`);
        
        // Increase stats on level up
        rpg.maxHp += Math.floor(rpg.maxHp * 0.1);
        rpg.hp = rpg.maxHp; // Heal on level up
        
        if (rpg.class === 'mage') {
            rpg.maxMp += Math.floor(rpg.maxMp * 0.15);
            rpg.magic += 2;
            rpg.intelligence += 1;
        } else if (rpg.class === 'warrior') {
            rpg.attack += 2;
            rpg.defense += 1;
            if (rpg.strength) rpg.strength += 2;
        } else if (rpg.class === 'archer') {
            rpg.attack += 1;
            rpg.agility += 2;
            if (rpg.dexterity) rpg.dexterity += 2;
        }

        // Check for evolution
        const newEvolution = checkEvolution(rpg);
        
        // Reward gold for level up
        const goldReward = rpg.level * 10;
        await addGold(userId, goldReward);

        // Store level up data for the highest level reached
        levelUpData = {
            level: rpg.level,
            evolution: newEvolution,
            goldReward: goldReward,
            stats: {
                maxHp: rpg.maxHp,
                maxMp: rpg.maxMp,
                attack: rpg.attack,
                defense: rpg.defense,
                magic: rpg.magic,
                agility: rpg.agility
            }
        };
    }

    // Guardar los cambios en la base de datos
    await User.updateRPG(userId, rpg);
    console.log(`💾 Saved RPG data. Level: ${rpg.level}, EXP: ${rpg.exp}/${rpg.maxExp}`);
    
    const result = {
        user: rpg,
        levelsGained: levelsGained,
        reachedMaxLevel: rpg.level >= 100,
        oldLevel: oldLevel,
        levelUpData: levelUpData
    };

    // Si hay una interacción y se subió de nivel, mostrar mensaje
    if (interaction && levelsGained > 0 && levelUpData) {
        console.log(`🎊 Showing level up message for level ${levelUpData.level}`);
        await showLevelUpMessage(interaction, result);
    } else if (levelsGained > 0) {
        console.log(`🎊 Level up detected but no interaction provided: Level ${levelUpData.level}`);
    }
    
    return result;
}
module.exports = {
    createCharacter,
    addExperience,
    getCharacter,
    calculateBattleRewards,
    completeQuest,
    showLevelUpMessage
};