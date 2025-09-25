// En la función chooseClass, asegurar que se guarde correctamente:

const chooseClass = (userId, className) => {
    try {
        if (!classes[className]) {
            return { success: false, message: '❌ Invalid class. Available classes: warrior, mage, archer.' };
        }
        
        const profile = getUserProfile(userId);
        
        if (profile.class) {
            return { success: false, message: '❌ You already have a class. You cannot change it.' };
        }
        
        const classInfo = classes[className];
        
        console.log(`Choosing class ${className} for user ${userId}`);
        
        // Actualizar perfil con la clase elegida
        profile.class = className;
        profile.className = classInfo.name;
        profile.maxHealth = classInfo.baseStats.health;
        profile.health = classInfo.baseStats.health;
        profile.maxMana = 50 + (classInfo.baseStats.magic * 2);
        profile.mana = 50 + (classInfo.baseStats.magic * 2);
        
        // Actualizar estadísticas base
        Object.keys(classInfo.baseStats).forEach(stat => {
            if (stat !== 'health') {
                profile.stats[stat] = classInfo.baseStats[stat];
            }
        });
        
        // Añadir habilidades de la clase
        const startingSkills = baseSkills[className].filter(skill => skill.level === 1);
        profile.skills = ['Basic Attack', ...startingSkills.map(skill => skill.name)];
        
        console.log('Profile before saving:', profile);
        
        // Guardar cambios
        const saveResult = saveProfile(userId, profile);
        
        if (!saveResult) {
            return { success: false, message: '❌ Error saving your class choice. Please try again.' };
        }
        
        // Verificar que se guardó correctamente
        const verifiedProfile = getUserProfile(userId);
        console.log('Verified profile after save:', verifiedProfile);
        
        if (verifiedProfile.class !== className) {
            return { success: false, message: '❌ Class selection failed to save. Please try again.' };
        }
        
        return { 
            success: true, 
            message: `🎉 You have become a ${classInfo.name}!`,
            class: classInfo
        };
        
    } catch (error) {
        console.error('Error choosing class:', error);
        return { success: false, message: '❌ Error choosing class.' };
    }
};