const fs = require('fs');

module.exports = {
  createClan(name, leaderId) {
    const database = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    
    if (!database.clans) database.clans = {};
    
    // Check if clan name exists
    if (Object.values(database.clans).some(clan => clan.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('A clan with that name already exists!');
    }
    
    // Check if user already leads a clan
    if (Object.values(database.clans).some(clan => clan.leader === leaderId)) {
      throw new Error('You already lead a clan!');
    }
    
    const clanId = Date.now().toString();
    database.clans[clanId] = {
      name: name,
      leader: leaderId,
      members: [leaderId],
      createdAt: new Date().toISOString(),
      level: 1
    };
    
    fs.writeFileSync('database.json', JSON.stringify(database, null, 2));
    return clanId;
  },
  
  getClanByMember(userId) {
    const database = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    return Object.values(database.clans || {}).find(clan => 
      clan.members.includes(userId)
    );
  }
};