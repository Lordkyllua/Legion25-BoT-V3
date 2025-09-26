const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Enhanced logger
const logger = {
    info: (msg) => console.log(`🌈 ${msg}`),
    success: (msg) => console.log(`✅ ${msg}`),
    error: (msg) => console.log(`❌ ${msg}`),
    warning: (msg) => console.log(`⚠️ ${msg}`),
    event: (msg) => console.log(`🎯 ${msg}`)
};

// Validate environment
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

// Global collections
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.logger = logger;

// Enhanced data management
class DataManager {
    constructor() {
        this.dataPath = path.join(__dirname, 'data');
        this.ensureDataDirectory();
        this.initializeDataFiles();
    }

    ensureDataDirectory() {
        if (!fs.existsSync(this.dataPath)) {
            fs.mkdirSync(this.dataPath, { recursive: true });
            logger.success('Created data directory');
        }
    }

    initializeDataFiles() {
        const defaultData = {
            'users.json': {},
            'points.json': {},
            'store.json': {
                items: [
                    {
                        id: 1,
                        name: "Health Potion",
                        price: 50,
                        type: "consumable",
                        category: "Consumables",
                        description: "Restores 30 HP",
                        class: "all"
                    },
                    {
                        id: 2,
                        name: "Mana Potion", 
                        price: 75,
                        type: "consumable",
                        category: "Consumables",
                        description: "Restores 25 MP",
                        class: "mage"
                    },
                    {
                        id: 3,
                        name: "Iron Sword",
                        price: 200,
                        type: "equipment", 
                        category: "Weapons",
                        description: "Basic warrior weapon",
                        class: "warrior",
                        requiredLevel: 3
                    }
                ]
            },
            'guilds.json': {},
            'config.json': {
                maintenance: false,
                version: "1.0.0"
            }
        };

        Object.entries(defaultData).forEach(([filename, data]) => {
            const filePath = path.join(this.dataPath, filename);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                logger.success(`Created ${filename}`);
            }
        });
    }

    getData(file) {
        try {
            const filePath = path.join(this.dataPath, file);
            if (!fs.existsSync(filePath)) {
                this.initializeDataFiles();
            }
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            logger.error(`Error reading ${file}: ${error.message}`);
            return null;
        }
    }

    saveData(file, data) {
        try {
            const filePath = path.join(this.dataPath, file);
            const tempPath = filePath + '.tmp';
            
            // Write to temporary file first
            fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
            
            // Then rename atomically
            fs.renameSync(tempPath, filePath);
            
            return true;
        } catch (error) {
            logger.error(`Error saving ${file}: ${error.message}`);
            return false;
        }
    }

    // Backup system
    createBackup() {
        try {
            const backupDir = path.join(__dirname, 'backups');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            const backupFile = path.join(backupDir, `backup-${Date.now()}.zip`);
            // Simple backup - copy data directory
            this.copyDirectory(this.dataPath, backupDir);
            
            logger.info(`Backup created: ${backupFile}`);
            return true;
        } catch (error) {
            logger.error(`Backup failed: ${error.message}`);
            return false;
        }
    }

    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const files = fs.readdirSync(src);
        files.forEach(file => {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            
            if (fs.statSync(srcPath).isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }
}

// Initialize data manager
client.dataManager = new DataManager();

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
    if (!fs.existsSync(componentsPath)) {
        fs.mkdirSync(componentsPath, { recursive: true });
        return;
    }

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

// Create necessary directories
const createDirectories = () => {
    const directories = [
        'components/buttons',
        'components/selectMenus',
        'components/modals',
        'backups'
    ];

    directories.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            logger.success(`Created directory: ${dir}`);
        }
    });
};

// Graceful shutdown handler
const setupGracefulShutdown = () => {
    const shutdown = async (signal) => {
        logger.warning(`Received ${signal}, shutting down gracefully...`);
        
        // Create backup before shutdown
        client.dataManager.createBackup();
        
        // Destroy client
        if (client && !client.destroyed) {
            client.destroy();
        }
        
        logger.success('Bot shutdown complete');
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('uncaughtException', (error) => {
        logger.error(`Uncaught Exception: ${error.message}`);
        shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
        shutdown('unhandledRejection');
    });
};

// Main initialization
const initializeBot = async () => {
    try {
        logger.info('Starting bot initialization...');
        
        // Create directories
        createDirectories();
        
        // Load components
        loadComponents('buttons', client.buttons);
        loadComponents('selectMenus', client.selectMenus);
        
        // Load events
        loadEvents();
        
        // Load commands and register
        const commands = loadCommands();
        
        // Login to Discord
        await client.login(process.env.DISCORD_TOKEN);
        
        // Register slash commands
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        
        logger.info('Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        
        logger.success(`Registered ${commands.length} slash commands globally!`);
        
        // Setup graceful shutdown
        setupGracefulShutdown();
        
        // Create initial backup
        client.dataManager.createBackup();
        
    } catch (error) {
        logger.error(`Failed to initialize bot: ${error.message}`);
        process.exit(1);
    }
};

// Beautiful startup banner
console.log(`
╔══════════════════════════════════════╗
║      🎮 SURVIVOR BOT 🎮             ║
║      Developed by LordK              ║
║      Robust Data System v2.0         ║
╚══════════════════════════════════════╝
`);

// Start the bot
initializeBot();