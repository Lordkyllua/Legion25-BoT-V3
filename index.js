const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

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

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online!`);
    console.log(`📊 Loaded ${client.commands.size} commands, ${client.buttons.size} buttons, ${client.selectMenus.size} select menus`);
    updateStatus();
    setInterval(updateStatus, 60000); // Update every minute
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
        // Handle both exact matches and pattern matches
        let button = client.buttons.get(interaction.customId);
        
        if (!button) {
            // Check for pattern matches (like start_quest_*)
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

client.login(process.env.DISCORD_TOKEN);