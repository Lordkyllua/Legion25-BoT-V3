const fs = require('fs');

module.exports = {
  getPoints(userId) {
    try {
      const pointsData = fs.readFileSync('points.json', 'utf8');
      const points = JSON.parse(pointsData);
      return points[userId] || 0;
    } catch (error) {
      // Si el archivo no existe o hay error, retornar 0
      return 0;
    }
  },
  
  addPoints(userId, amount) {
    try {
      const pointsData = fs.readFileSync('points.json', 'utf8');
      const points = JSON.parse(pointsData);
      points[userId] = (points[userId] || 0) + amount;
      fs.writeFileSync('points.json', JSON.stringify(points, null, 2));
      return points[userId];
    } catch (error) {
      // Si hay error, crear archivo nuevo
      const points = { [userId]: amount };
      fs.writeFileSync('points.json', JSON.stringify(points, null, 2));
      return amount;
    }
  },
  
  removePoints(userId, amount) {
    try {
      const pointsData = fs.readFileSync('points.json', 'utf8');
      const points = JSON.parse(pointsData);
      points[userId] = Math.max((points[userId] || 0) - amount, 0);
      fs.writeFileSync('points.json', JSON.stringify(points, null, 2));
      return points[userId];
    } catch (error) {
      return 0;
    }
  }
};