const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Beautiful console logging
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

// Load components - MEJORADO: Manejo de errores robusto
const loadComponents = (type, collection) => {
  const componentsPath = path.join(__dirname, 'components', type);
  
  if (!fs.existsSync(componentsPath)) {
    logger.warning(`Components directory not found: ${componentsPath}`);
    return;
  }

  const componentFiles = fs.readdirSync(componentsPath).filter(file => file.endsWith('.js'));
  
  if (componentFiles.length === 0) {
    logger.warning(`No component files found in: ${componentsPath}`);
    return;
  }

  componentFiles.forEach(file => {
    try {
      const componentPath = path.join(componentsPath, file);
      delete require.cache[require.resolve(componentPath)]; // Clear cache
      const component = require(componentPath);
      
      // Usar el nombre del archivo sin extensión como clave
      const componentName = file.replace('.js', '');
      collection.set(componentName, component);
      logger.success(`Loaded ${type}: ${componentName}`);
      
    } catch (error) {
      logger.error(`Failed to load component ${file}: ${error.message}`);
      console.error(error.stack); // Mostrar stack trace completo
    }
  });
};

// Load events
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

// Initialize data files - MEJORADO: Validación de JSON
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
    } else {
      // Validar que el JSON existente sea válido
      try {
        const data = fs.readFileSync(name, 'utf8');
        JSON.parse(data);
        logger.success(`Validated data file: ${name}`);
      } catch (error) {
        logger.error(`Invalid JSON in ${name}, creating backup and resetting...`);
        // Crear backup del archivo corrupto
        const backupName = `${name}.backup.${Date.now()}`;
        fs.copyFileSync(name, backupName);
        // Restaurar archivo por defecto
        fs.writeFileSync(name, JSON.stringify(defaultData, null, 2));
        logger.success(`Restored ${name} from backup`);
      }
    }
  });
};

// Create necessary directories
const createDirectories = () => {
  const directories = [
    'components/buttons',
    'components/selectMenus',
    'components/modals',
    'utils',
    'backups' // Nueva carpeta para backups
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.success(`Created directory: ${dir}`);
    }
  });
};

// Simple backup system - NUEVO
const createBackup = () => {
  try {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFiles = ['database.json', 'points.json', 'store.json'];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    backupFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const backupFile = path.join(backupDir, `${file}.backup.${timestamp}`);
        fs.copyFileSync(file, backupFile);
      }
    });
    
    logger.success('Backup created successfully');
  } catch (error) {
    logger.error('Backup failed:', error.message);
  }
};

// Database service simple - NUEVO
const databaseService = {
  async readFile(filePath, defaultValue = {}) {
    try {
      if (!fs.existsSync(filePath)) {
        return defaultValue;
      }
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error reading ${filePath}:`, error.message);
      return defaultValue;
    }
  },
  
  async writeFile(filePath, data) {
    try {
      const tempPath = filePath + '.tmp';
      await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2));
      await fs.promises.rename(tempPath, filePath);
      return true;
    } catch (error) {
      logger.error(`Error writing ${filePath}:`, error.message);
      return false;
    }
  }
};

// Asignar databaseService al client
client.database = databaseService;

// Main initialization - MEJORADO
const initializeBot = async () => {
  logger.info('Starting bot initialization...');
  
  createDirectories();
  initializeData();
  
  // Crear backup inicial
  createBackup();
  
  const commands = loadCommands();
  loadEvents();
  
  loadComponents('buttons', client.buttons);
  loadComponents('selectMenus', client.selectMenus);
  
  // DEBUG: Mostrar componentes cargados
  logger.info(`Buttons loaded: ${Array.from(client.buttons.keys()).join(', ') || 'None'}`);
  logger.info(`SelectMenus loaded: ${Array.from(client.selectMenus.keys()).join(', ') || 'None'}`);
  logger.info(`Commands loaded: ${Array.from(client.commands.keys()).join(', ')}`);

  try {
    await client.login(process.env.DISCORD_TOKEN);
    
    // Register slash commands after login
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    logger.success(`Registered ${commands.length} slash commands globally!`);
    
    // Backup cada 6 horas - NUEVO
    setInterval(() => {
      createBackup();
    }, 6 * 60 * 60 * 1000);
    
  } catch (error) {
    logger.error(`Failed to initialize bot: ${error.message}`);
    process.exit(1);
  }
};

// Handle graceful shutdown - MEJORADO
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  
  // Crear backup final
  createBackup();
  
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down...');
  
  createBackup();
  client.destroy();
  process.exit(0);
});

// Manejo de errores no capturados - NUEVO
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  createBackup();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  createBackup();
});

// Start the bot
initializeBot();
