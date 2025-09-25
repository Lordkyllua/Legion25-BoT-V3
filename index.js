const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Beautiful console logging - DEFINIDO CORRECTAMENTE
const logger = {
  info: (msg) => console.log(`🌈 ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️ ${msg}`),
  event: (msg) => console.log(`🎯 ${msg}`)
};

// Validate environment variables
if (!process.env.DISCORD_TOKEN) {
  logger.error('DISCORD_TOKEN environment variable is required!');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration
  ]
});

// Asignar logger al client para acceso global
client.logger = logger;

// Beautiful startup banner
console.log(`
╔══════════════════════════════════════╗
║      🎮 SURVIVOR BOT 🎮             ║
║      Developed by LordK              ║
║      Inspired by Tiny Survivors      ║
╚══════════════════════════════════════╝
`);

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();

// Load commands
const loadCommands = () => {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  const commands = [];

  commandFiles.forEach(file => {
    try {
      const command = require(path.join(commandsPath, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        logger.success(`Loaded command: /${command.data.name}`);
      }
    } catch (error) {
      logger.error(`Failed to load command ${file}: ${error.message}`);
    }
  });

  return commands;
};

// Load components
const loadComponents = (type, collection) => {
  const componentsPath = path.join(__dirname, 'components', type);
  if (!fs.existsSync(componentsPath)) return;

  const componentFiles = fs.readdirSync(componentsPath).filter(file => file.endsWith('.js'));
  componentFiles.forEach(file => {
    try {
      const component = require(path.join(componentsPath, file));
      collection.set(component.name, component);
      logger.success(`Loaded ${type}: ${component.name}`);
    } catch (error) {
      logger.error(`Failed to load component ${file}: ${error.message}`);
    }
  });
};

// Load events - CORREGIDO: pasar client en lugar de logger
const loadEvents = () => {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  eventFiles.forEach(file => {
    try {
      const event = require(path.join(eventsPath, file));
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      logger.event(`Loaded event: ${event.name}`);
    } catch (error) {
      logger.error(`Failed to load event ${file}: ${error.message}`);
    }
  });
};

// Initialize data files
const initializeData = () => {
  const dataFiles = [
    { name: 'points.json', default: {} },
    { name: 'store.json', default: { items: [] } },
    { name: 'database.json', default: { users: {}, clans: {}, warnings: {} } }
  ];

  // Crear directorio utils si no existe
  if (!fs.existsSync('utils')) {
    fs.mkdirSync('utils');
  }
  
  // Crear rolesConfig.json en utils
  if (!fs.existsSync('utils/rolesConfig.json')) {
    fs.writeFileSync('utils/rolesConfig.json', JSON.stringify({ assignableRoles: [], adminRoles: [] }, null, 2));
  }

  dataFiles.forEach(({ name, default: defaultData }) => {
    if (!fs.existsSync(name)) {
      fs.writeFileSync(name, JSON.stringify(defaultData, null, 2));
      logger.success(`Created data file: ${name}`);
    }
  });
};

// Create necessary directories
const createDirectories = () => {
  const directories = [
    'components/buttons',
    'components/selectMenus',
    'components/modals',
    'utils'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.success(`Created directory: ${dir}`);
    }
  });
};

// Main initialization
const initializeBot = async () => {
  logger.info('Starting bot initialization...');
  
  createDirectories();
  initializeData();
  
  const commands = loadCommands();
  loadEvents();
  
  loadComponents('buttons', client.buttons);
  loadComponents('selectMenus', client.selectMenus);

  try {
    await client.login(process.env.DISCORD_TOKEN);
    
    // Register slash commands after login
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    logger.success(`Registered ${commands.length} slash commands globally!`);
  } catch (error) {
    logger.error(`Failed to initialize bot: ${error.message}`);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down...');
  client.destroy();
  process.exit(0);
});

// Start the bot
initializeBot();