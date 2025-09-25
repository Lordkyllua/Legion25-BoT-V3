const fs = require('fs');
const path = require('path');

module.exports = {
    getPoints(userId) {
        try {
            const pointsPath = path.join(__dirname, '../points.json');
            const pointsData = fs.readFileSync(pointsPath, 'utf8');
            const points = JSON.parse(pointsData);
            return points[userId] || 0;
        } catch (error) {
            return 0;
        }
    },
    
    addPoints(userId, amount) {
        try {
            const pointsPath = path.join(__dirname, '../points.json');
            const pointsData = fs.readFileSync(pointsPath, 'utf8');
            const points = JSON.parse(pointsData);
            points[userId] = (points[userId] || 0) + amount;
            fs.writeFileSync(pointsPath, JSON.stringify(points, null, 2));
            return points[userId];
        } catch (error) {
            // If error, create new file
            const points = { [userId]: amount };
            fs.writeFileSync(pointsPath, JSON.stringify(points, null, 2));
            return amount;
        }
    },
    
    removePoints(userId, amount) {
        try {
            const pointsPath = path.join(__dirname, '../points.json');
            const pointsData = fs.readFileSync(pointsPath, 'utf8');
            const points = JSON.parse(pointsData);
            points[userId] = Math.max((points[userId] || 0) - amount, 0);
            fs.writeFileSync(pointsPath, JSON.stringify(points, null, 2));
            return points[userId];
        } catch (error) {
            return 0;
        }
    }
};