const fs = require('fs');
const path = require('path');

// Class system with evolutions (English)
const classes = {
  warrior: {
    name: "Warrior",
    description: "A melee fighter with high resistance and physical damage.",
    baseStats: {
      health: 150,
      attack: 20,
      defense: 15,
      magic: 5,
      agility: 8
    },
    evolutions: {
      25: [
        {
          name: "Berserker",
          description: "Warrior focused on pure damage and battle fury",
          stats: { health: 50, attack: 30, defense: -5, magic: 0, agility: 10 },
          skills: ["Berserker Fury", "Bloody Strike"],
          special: "Increased critical attacks"
        },
        {
          name: "Paladin",
          description: "Holy warrior with defensive and healing abilities",
          stats: { health: 30, attack: 15, defense: 25, magic: 10, agility: 5 },
          skills: ["Divine Shield", "Healing Light"],
          special: "Resistance to dark magic"
        }
      ],
      50: [
        {
          name: "Dragon Knight",
          description: "Master of mounted combat with dragon allies",
          stats: { health: 100, attack: 40, defense: 30, magic: 15, agility: 20 },
          skills: ["Dragon Breath", "Epic Charge"],
          special: "Can summon dragon whelps"
        },
        {
          name: "War Titan",
          description: "Colossal warrior with superhuman strength",
          stats: { health: 150, attack: 45, defense: 35, magic: 5, agility: -10 },
          skills: ["Earthquake", "Titanic Strike"],
          special: "Immune to stuns"
        }
      ],
      75: [
        {
          name: "Warlord",
          description: "Legendary leader who commands entire armies",
          stats: { health: 200, attack: 60, defense: 40, magic: 20, agility: 15 },
          skills: ["Battle Cry", "Master Strategy"],
          special: "Increases group stats"
        },
        {
          name: "God of War",
          description: "Divine being with power to change the course of battles",
          stats: { health: 250, attack: 80, defense: 50, magic: 30, agility: 25 },
          skills: ["Final Judgment", "Summon Army"],
          special: "Unique divine abilities"
        }
      ]
    }
  },
  mage: {
    name: "Mage",
    description: "A powerful spellcaster with devastating magical damage.",
    baseStats: {
      health: 100,
      attack: 8,
      defense: 8,
      magic: 25,
      agility: 10
    },
    evolutions: {
      25: [
        {
          name: "Elemental Sorcerer",
          description: "Mage who masters the four natural elements",
          stats: { health: 20, attack: 5, defense: 10, magic: 35, agility: 15 },
          skills: ["Elemental Storm", "Fire Shield"],
          special: "Bonus to elemental damage"
        },
        {
          name: "Necromancer",
          description: "Practitioner of dark magic and death manipulation",
          stats: { health: -20, attack: 10, defense: 5, magic: 40, agility: 10 },
          skills: ["Summon Skeletons", "Drain Life"],
          special: "Can revive allies"
        }
      ],
      50: [
        {
          name: "Archmage",
          description: "Mage of infinite knowledge and arcane power",
          stats: { health: 50, attack: 15, defense: 20, magic: 60, agility: 20 },
          skills: ["Meteor Shower", "Arcane Field"],
          special: "Fast mana regeneration"
        },
        {
          name: "Illusionist",
          description: "Master of deception and mental manipulation",
          stats: { health: 30, attack: 20, defense: 15, magic: 55, agility: 30 },
          skills: ["Mirage", "Mind Control"],
          special: "Can confuse enemies"
        }
      ],
      75: [
        {
          name: "Arcane Sage",
          description: "Being of pure knowledge who transcends conventional magic",
          stats: { health: 100, attack: 25, defense: 30, magic: 90, agility: 25 },
          skills: ["Reality Rewrite", "Eternal Wisdom"],
          special: "Can learn any spell"
        },
        {
          name: "God of Magic",
          description: "Deity who embodies magical power in its purest form",
          stats: { health: 150, attack: 30, defense: 40, magic: 120, agility: 35 },
          skills: ["Creation", "Annihilation"],
          special: "Infinite magic"
        }
      ]
    }
  },
  archer: {
    name: "Archer",
    description: "A precise shooter with high mobility and ranged attacks.",
    baseStats: {
      health: 120,
      attack: 18,
      defense: 10,
      magic: 8,
      agility: 20
    },
    evolutions: {
      25: [
        {
          name: "Hunter",
          description: "Expert in tracking and hunting powerful beasts",
          stats: { health: 30, attack: 25, defense: 10, magic: 5, agility: 25 },
          skills: ["Track", "Precise Shot"],
          special: "Bonus against beasts"
        },
        {
          name: "Assassin",
          description: "Specialist in quick and silent eliminations",
          stats: { health: 10, attack: 30, defense: 5, magic: 10, agility: 35 },
          skills: ["Lethal Blow", "Stealth"],
          special: "Increased critical damage"
        }
      ],
      50: [
        {
          name: "Elite Sniper",
          description: "Sniper with supernatural precision",
          stats: { health: 50, attack: 45, defense: 15, magic: 15, agility: 40 },
          skills: ["Long Distance Shot", "Perfect Aim"],
          special: "No minimum range"
        },
        {
          name: "Stalker",
          description: "Master of camouflage and surprise attacks",
          stats: { health: 40, attack: 40, defense: 20, magic: 20, agility: 45 },
          skills: ["Camouflage", "Ambush"],
          special: "Can move undetected"
        }
      ],
      75: [
        {
          name: "Legend of the Bow",
          description: "Hero whose arrows change the course of battles",
          stats: { health: 80, attack: 70, defense: 25, magic: 25, agility: 60 },
          skills: ["Arrow Rain", "Arrow of Victory"],
          special: "Arrows penetrate armor"
        },
        {
          name: "God of Archery",
          description: "Deity of precision and speed",
          stats: { health: 100, attack: 85, defense: 30, magic: 30, agility: 75 },
          skills: ["Divine Shot", "Supreme Speed"],
          special: "Can shoot multiple arrows"
        }
      ]
    }
  }
};

// Base skills in English
const baseSkills = {
  warrior: [
    { name: "Powerful Strike", level: 1, damage: 25, cost: 10 },
    { name: "Ultimate Sword", level: 5, damage: 45, cost: 20 },
    { name: "Warrior's Fury", level: 10, damage: 70, cost: 30 },
    { name: "Earthquake", level: 15, damage: 100, cost: 40 },
    { name: "War Cry", level: 20, damage: 130, cost: 50 }
  ],
  mage: [
    { name: "Fireball", level: 1, damage: 20, cost: 15 },
    { name: "Ice Ray", level: 5, damage: 35, cost: 25 },
    { name: "Arcane Storm", level: 10, damage: 60, cost: 35 },
    { name: "Meteor", level: 15, damage: 90, cost: 50 },
    { name: "Arcane Spell", level: 20, damage: 120, cost: 65 }
  ],
  archer: [
    { name: "Quick Arrow", level: 1, damage: 18, cost: 8 },
    { name: "Multiple Shot", level: 5, damage: 40, cost: 18 },
    { name: "Penetrating Arrow", level: 10, damage: 55, cost: 25 },
    { name: "Arrow Rain", level: 15, damage: 80, cost: 35 },
    { name: "Perfect Shot", level: 20, damage: 110, cost: 45 }
  ]
};

// Rest of the functions remain the same but with English messages...
// [Previous code structure remains the same, but messages in English]