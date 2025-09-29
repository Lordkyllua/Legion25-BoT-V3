const { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const database = require('./config/database');
require('colors');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();

// Load commands recursively from all subfolders
function loadCommands(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            // Recursively load commands from subdirectories
            loadCommands(itemPath);
        } else if (item.endsWith('.js')) {
            try {
                const command = require(itemPath);
                if (command.data && command.execute) {
                    client.commands.set(command.data.name, command);
                    console.log(`✅ Loaded command: ${command.data.name}`.green);
                }
            } catch (error) {
                console.error(`❌ Error loading command ${itemPath}:`.red, error.message);
            }
        }
    }
}

// Load all commands
loadCommands(path.join(__dirname, 'commands'));

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Load components
const componentsPath = path.join(__dirname, 'components');
loadComponents(componentsPath);

function loadComponents(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            loadComponents(itemPath);
        } else if (item.endsWith('.js')) {
            try {
                const component = require(itemPath);
                if (component.customId) {
                    if (dir.includes('buttons')) {
                        // Para botones con customId que empiezan con un prefijo
                        if (component.customId.endsWith('_')) {
                            // Es un botón con prefijo dinámico
                            client.buttons.set(component.customId, component);
                            console.log(`✅ Loaded dynamic button: ${component.customId}`.blue);
                        } else {
                            client.buttons.set(component.customId, component);
                            console.log(`✅ Loaded button: ${component.customId}`.blue);
                        }
                    } else if (dir.includes('selectMenus')) {
                        client.selectMenus.set(component.customId, component);
                        console.log(`✅ Loaded select menu: ${component.customId}`.cyan);
                    }
                }
            } catch (error) {
                console.error(`❌ Error loading component ${itemPath}:`.red, error.message);
            }
        }
    }
}

// Register slash commands
const commands = [];
for (const command of client.commands.values()) {
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Rotating statuses
const statuses = [
    { name: 'Micro Hunter RPG', type: ActivityType.Playing },
    { name: '/help for commands', type: ActivityType.Listening },
    { name: 'with MongoDB database', type: ActivityType.Playing },
    { name: 'in the forest', type: ActivityType.Playing },
    { name: 'with dragons', type: ActivityType.Playing },
    { name: 'the quest for gold', type: ActivityType.Playing },
    { name: 'with friends', type: ActivityType.Playing },
    { name: '/rpg to start adventure', type: ActivityType.Listening }
];

client.once('ready', async () => {
    try {
        console.log('╔══════════════════════════════════════╗'.cyan);
        console.log('║          LEGION25 BOT v3.0          ║'.cyan);
        console.log('║    Developed by LordK with ❤️       ║'.cyan);
        console.log('║   MongoDB Database Enabled          ║'.cyan);
        console.log('╚══════════════════════════════════════╝'.cyan);
        
        // Connect to MongoDB
        await database.connect();
        
        if (database.isConnected) {
            console.log('✅ Database connection established'.green);
            
            // Initialize default shop items only if DB is connected
            const Shop = require('./models/Shop');
            await Shop.initializeDefaultItems();
        } else {
            console.log('⚠️  Running without database connection'.yellow);
        }

        console.log(`🤖 Logged in as ${client.user.tag}!`.green);
        console.log(`🎮 Loaded ${client.commands.size} commands`.blue);
        console.log(`🔘 Loaded ${client.buttons.size} buttons`.magenta);
        console.log(`📋 Loaded ${client.selectMenus.size} select menus`.cyan);
        console.log(`👥 Serving ${client.guilds.cache.size} servers`.magenta);

        // Register commands
        console.log('🔄 Refreshing application commands...'.yellow);
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('✅ Successfully reloaded application commands!'.green);

        // Rotate status every minute
        let statusIndex = 0;
        setInterval(() => {
            const status = statuses[statusIndex];
            client.user.setActivity(status.name, { type: status.type });
            statusIndex = (statusIndex + 1) % statuses.length;
        }, 60000);

    } catch (error) {
        console.error('❌ Error during startup:'.red, error);
        // No process.exit(1) para que el bot siga funcionando
    }
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...'.yellow);
    await database.disconnect();
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 Received SIGTERM, shutting down...'.yellow);
    await database.disconnect();
    client.destroy();
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);