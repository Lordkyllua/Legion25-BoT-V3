const Gold = require('../models/Gold');

async function addGold(userId, amount) {
    try {
        return await Gold.addGold(userId, amount);
    } catch (error) {
        console.error('Error adding gold:', error);
        throw error;
    }
}

async function getGold(userId) {
    try {
        return await Gold.getBalance(userId);
    } catch (error) {
        console.error('Error getting gold:', error);
        return 0;
    }
}

async function setGold(userId, amount) {
    try {
        return await Gold.setBalance(userId, amount);
    } catch (error) {
        console.error('Error setting gold:', error);
        throw error;
    }
}

async function removeGold(userId, amount) {
    try {
        return await Gold.removeGold(userId, amount);
    } catch (error) {
        console.error('Error removing gold:', error);
        throw error;
    }
}

async function transferGold(fromUserId, toUserId, amount) {
    try {
        return await Gold.transferGold(fromUserId, toUserId, amount);
    } catch (error) {
        console.error('Error transferring gold:', error);
        throw error;
    }
}

module.exports = {
    addGold,
    getGold,
    setGold,
    removeGold,
    transferGold
};