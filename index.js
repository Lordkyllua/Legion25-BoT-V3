const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// No necesitas dotenv en Railway - usa variables de entorno directamente
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

// MongoDB connection for Railway
async function connectToDatabase() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in Railway environment variables');
        }

        // Verificar que no tenga <db_password>
        if (MONGODB_URI.includes('<db_password>')) {
            throw new Error('MONGODB_URI contains <db_password> - replace with actual password in Railway variables');
        }

        console.log('🔗 Connecting to MongoDB...');
        console.log(`📊 Database: ${MONGODB_URI.split('/').pop().split('?')[0]}`);
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ Connected to MongoDB successfully!');
        console.log(`🏢 Host: ${mongoose.connection.host}`);
        console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        
        if (error.message.includes('<db_password>')) {
            console.error('   🔐 ERROR: MONGODB_URI contains <db_password>');
            console.error('   💡 Solution:');
            console.error('      1. Go to Railway dashboard → Variables');
            console.error('      2. Set MONGODB_URI to: mongodb+srv://LordK21:YOUR_REAL_PASSWORD@legion25.hhyjic3.mongodb.net/microhunter?retryWrites=true&w=majority');
            console.error('      3. Replace YOUR_REAL_PASSWORD with your actual MongoDB password');
        } else if (error.name === 'MongoServerError' && error.code === 18) {
            console.error('   🔐 Authentication failed');
            console.error('   💡 Please check:');
            console.error('      - Password in MONGODB_URI is correct');
            console.error('      - User "LordK21" exists in MongoDB Atlas');
            console.error('      - IP whitelist includes Railway IPs (0.0.0.0/0)');
        } else {
            console.error(`   📝 Error: ${error.message}`);
        }
        
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
    { name: 'Hosted on Railway', type: ActivityType.Custom }
];

function updateStatus() {
    const status = statuses[statusIndex];
    client.user.setActivity(status.name, { type: status.type });
    statusIndex = (statusIndex + 1) % statuses.length;
}

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online!`);
    console.log(`📊 Loaded ${client.commands.size} commands, ${client.buttons.size} buttons, ${client.selectMenus.size} select menus`);
    console.log(`🚀 Host: Railway`);
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

// Start bot
async function startBot() {
    try {
        await connectToDatabase();
        
        if (!process.env.DISCORD_TOKEN) {
            throw new Error('DISCORD_TOKEN is not defined in Railway environment variables');
        }
        
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('Failed to start bot:', error.message);
        process.exit(1);
    }
}

startBot();