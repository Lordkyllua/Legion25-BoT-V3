const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // ✅ AGREGAR ESTO AL INICIO

// Verificar variables de entorno antes de iniciar
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN is not defined in environment variables');
    process.exit(1);
}

if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
    }
}

// Load components
const componentsPath = path.join(__dirname, 'components');
const buttonFiles = fs.readdirSync(path.join(componentsPath, 'buttons')).filter(file => file.endsWith('.js'));
const selectMenuFiles = fs.readdirSync(path.join(componentsPath, 'selectMenus')).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    try {
        const button = require(path.join(componentsPath, 'buttons', file));
        if (button.name && button.execute) {
            client.buttons.set(button.name, button);
            console.log(`✅ Loaded button: ${button.name}`);
        }
    } catch (error) {
        console.error(`❌ Error loading button ${file}:`, error.message);
    }
}

for (const file of selectMenuFiles) {
    try {
        const selectMenu = require(path.join(componentsPath, 'selectMenus', file));
        if (selectMenu.name && selectMenu.execute) {
            client.selectMenus.set(selectMenu.name, selectMenu);
            console.log(`✅ Loaded select menu: ${selectMenu.name}`);
        }
    } catch (error) {
        console.error(`❌ Error loading select menu ${file}:`, error.message);
    }
}

// MongoDB connection with better error handling
async function connectToDatabase() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        
        // Parse the URI to check format (without exposing password)
        const uri = process.env.MONGODB_URI;
        const dbName = uri.split('/').pop().split('?')[0];
        const cluster = uri.includes('@') ? uri.split('@')[1].split('.')[0] : 'local';
        
        console.log(`📊 Database: ${dbName}`);
        console.log(`🏢 Cluster: ${cluster}`);
        
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });
        
        console.log('✅ Connected to MongoDB successfully!');
        
        // Verificar que los modelos estén registrados
        console.log('📋 Registered models:', Object.keys(mongoose.models));
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        
        if (error.name === 'MongoServerError') {
            switch (error.code) {
                case 18:
                    console.error('   🔐 Authentication failed');
                    console.error('   💡 Please check:');
                    console.error('      - Username and password in MONGODB_URI');
                    console.error('      - Database user exists and has permissions');
                    console.error('      - IP address is whitelisted in MongoDB Atlas');
                    break;
                case 8000:
                    console.error('   🔐 Invalid authentication mechanism');
                    break;
                default:
                    console.error(`   📝 Error code: ${error.code}`);
                    console.error(`   📝 Message: ${error.message}`);
            }
        } else if (error.name === 'MongooseServerSelectionError') {
            console.error('   🌐 Network error:');
            console.error('   💡 Please check:');
            console.error('      - Internet connection');
            console.error('      - MongoDB Atlas IP whitelist');
            console.error('      - Firewall settings');
        } else {
            console.error('   📝 Error details:', error.message);
        }
        
        console.error('\n🛠️ Troubleshooting steps:');
        console.error('   1. Verify MONGODB_URI in .env file');
        console.error('   2. Check MongoDB Atlas database user permissions');
        console.error('   3. Add your IP to MongoDB Atlas network access');
        console.error('   4. Test connection with MongoDB Compass');
        
        process.exit(1);
    }
}

// Rotating status
let statusIndex = 0;
const statuses = [
    { name: 'Micro Hunter RPG', type: ActivityType.Playing },
    { name: '/help for commands', type: ActivityType.Listening },
    { name: 'Level 100 Max', type: ActivityType.Competing },
    { name: 'Warriors vs Mages', type: ActivityType.Watching },
    { name: 'Admin /reset available', type: ActivityType.Custom }
];

function updateStatus() {
    const status = statuses[statusIndex];
    client.user.setActivity(status.name, { type: status.type });
    statusIndex = (statusIndex + 1) % statuses.length;
}

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is online!`);
    console.log(`📊 Loaded ${client.commands.size} commands, ${client.buttons.size} buttons, ${client.selectMenus.size} select menus`);
    updateStatus();
    setInterval(updateStatus, 60000);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing command ${interaction.commandName}:`, error);
            await interaction.reply({ 
                content: 'There was an error executing this command!', 
                ephemeral: true 
            });
        }
    } else if (interaction.isButton()) {
        let button = client.buttons.get(interaction.customId);
        
        if (!button) {
            for (const [name, btn] of client.buttons.entries()) {
                if (interaction.customId.startsWith(name.replace('_', ''))) {
                    button = btn;
                    break;
                }
            }
        }

        if (!button) return;

        try {
            await button.execute(interaction);
        } catch (error) {
            console.error(`Error executing button ${interaction.customId}:`, error);
        }
    } else if (interaction.isStringSelectMenu()) {
        const selectMenu = client.selectMenus.get(interaction.customId);
        if (!selectMenu) return;

        try {
            await selectMenu.execute(interaction);
        } catch (error) {
            console.error(`Error executing select menu ${interaction.customId}:`, error);
        }
    }
});

// Connect to database and then login
async function startBot() {
    try {
        await connectToDatabase();
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

startBot();