const Gold = require('../models/Gold');

async function addGold(userId, gold) {
    return await Gold.addGold(userId, gold);
}

async function getGold(userId) {
    return await Gold.getBalance(userId);
}

async function setGold(userId, gold) {
    return await Gold.setBalance(userId, gold);
}

async function transferGold(fromUserId, toUserId, amount) {
    return await Gold.transferGold(fromUserId, toUserId, amount);
}

module.exports = {
    addGold,
    getGold,
    setGold,
    transferGold
};