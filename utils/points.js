// Now using the new data management system from rpg.js
// This file is maintained for backward compatibility

const { getPoints, addPoints, removePoints } = require('./rpg');

module.exports = {
    getPoints,
    addPoints, 
    removePoints
};