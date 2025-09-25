const fs = require('fs');
const path = require('path');

// Función para obtener el perfil del usuario
function getUserProfile(userId) {
    try {
        const databasePath = path.join(__dirname, '../database.json');
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        // Verificar si el usuario existe y tiene perfil RPG
        if (database.users && database.users[userId] && database.users[userId].rpg) {
            return database.users[userId].rpg;
        }
        
        // Crear perfil por defecto si no existe
        const defaultProfile = {
            level: 1,
            exp: 0,
            expToNextLevel: 100,
            health: 100,
            gold: 50,
            class: 'Adventurer',
            skills: ['Basic Attack'],
            equipment: {
                weapon: 'Wooden Sword',
                armor: 'Cloth Tunic'
            }
        };
        
        // Guardar el perfil por defecto
        if (!database.users) database.users = {};
        if (!database.users[userId]) database.users[userId] = {};
        database.users[userId].rpg = defaultProfile;
        
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        return defaultProfile;
        
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        // Retornar perfil por defecto en caso de error
        return {
            level: 1,
            exp: 0,
            expToNextLevel: 100,
            health: 100,
            gold: 50,
            class: 'Adventurer',
            skills: ['Basic Attack'],
            equipment: {
                weapon: 'Wooden Sword',
                armor: 'Cloth Tunic'
            }
        };
    }
}

// Función para agregar experiencia
function addExperience(userId, exp) {
    try {
        const profile = getUserProfile(userId);
        profile.exp += exp;
        
        let leveledUp = false;
        let levelsGained = 0;
        
        // Verificar si sube de nivel
        while (profile.exp >= profile.expToNextLevel) {
            profile.exp -= profile.expToNextLevel;
            profile.level++;
            profile.expToNextLevel = Math.floor(profile.expToNextLevel * 1.5);
            profile.health += 20;
            profile.gold += profile.level * 10;
            leveledUp = true;
            levelsGained++;
        }
        
        // Guardar los cambios
        const databasePath = path.join(__dirname, '../database.json');
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        if (!database.users) database.users = {};
        if (!database.users[userId]) database.users[userId] = {};
        database.users[userId].rpg = profile;
        
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        
        return { 
            leveledUp, 
            levelsGained, 
            newLevel: profile.level,
            currentExp: profile.exp,
            nextLevelExp: profile.expToNextLevel
        };
        
    } catch (error) {
        console.error('Error in addExperience:', error);
        return { leveledUp: false, levelsGained: 0, newLevel: 1 };
    }
}

// Función para agregar oro
function addGold(userId, amount) {
    try {
        const profile = getUserProfile(userId);
        profile.gold += amount;
        
        // Guardar los cambios
        const databasePath = path.join(__dirname, '../database.json');
        const databaseData = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(databaseData);
        
        if (!database.users) database.users = {};
        if (!database.users[userId]) database.users[userId] = {};
        database.users[userId].rpg = profile;
        
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
        
        return profile.gold;
        
    } catch (error) {
        console.error('Error in addGold:', error);
        return 0;
    }
}

// Exportar las funciones correctamente
module.exports = {
    getUserProfile,
    addExperience,
    addGold
};