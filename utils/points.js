const fs = require('fs');

module.exports = {
  getPoints(userId) {
    try {
      const points = JSON.parse(fs.readFileSync('points.json', 'utf8'));
      return points[userId] || 0;
    } catch (error) {
      return 0;
    }
  },
  
  addPoints(userId, amount) {
    const points = JSON.parse(fs.readFileSync('points.json', 'utf8'));
    points[userId] = (points[userId] || 0) + amount;
    fs.writeFileSync('points.json', JSON.stringify(points, null, 2));
    return points[userId];
  },
  
  removePoints(userId, amount) {
    const points = JSON.parse(fs.readFileSync('points.json', 'utf8'));
    points[userId] = Math.max((points[userId] || 0) - amount, 0);
    fs.writeFileSync('points.json', JSON.stringify(points, null, 2));
    return points[userId];
  },
  
  getLeaderboard(limit = 10) {
    const points = JSON.parse(fs.readFileSync('points.json', 'utf8'));
    return Object.entries(points)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
  }
};
