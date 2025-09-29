// This file is maintained for compatibility
// Use gold.js instead for new features

const { getGold, addGold } = require('./gold');

module.exports = {
    getPoints: getGold,
    addPoints: addGold
};