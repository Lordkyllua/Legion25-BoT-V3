const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing command ${interaction.commandName}:`, error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.isButton()) {
            console.log(`🔘 Button clicked: ${interaction.customId}`.yellow);
            
            // Buscar botón por exact match primero
            let button = interaction.client.buttons.get(interaction.customId);
            
            // Si no se encuentra, buscar por prefijo dinámico
            if (!button) {
                for (const [customId, btn] of interaction.client.buttons.entries()) {
                    if (customId.endsWith('_') && interaction.customId.startsWith(customId)) {
                        button = btn;
                        console.log(`🔍 Found dynamic button handler: ${customId}`.blue);
                        break;
                    }
                }
            }

            if (button) {
                try {
                    await button.execute(interaction);
                } catch (error) {
                    console.error(`Error handling button ${interaction.customId}:`, error);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error handling this button!', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'There was an error handling this button!', ephemeral: true });
                    }
                }
            } else {
                console.log(`❌ No button handler found for: ${interaction.customId}`.red);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'This button is not working right now. Please try again later.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'This button is not working right now. Please try again later.', ephemeral: true });
                }
            }
        } else if (interaction.isStringSelectMenu()) {
            console.log(`📋 Select menu used: ${interaction.customId}`.yellow);
            
            const selectMenu = interaction.client.selectMenus.get(interaction.customId);
            if (selectMenu) {
                try {
                    await selectMenu.execute(interaction);
                } catch (error) {
                    console.error(`Error handling select menu ${interaction.customId}:`, error);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error handling this selection!', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'There was an error handling this selection!', ephemeral: true });
                    }
                }
            } else {
                console.log(`❌ No select menu handler found for: ${interaction.customId}`.red);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'This selection is not working right now.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'This selection is not working right now.', ephemeral: true });
                }
            }
        }
    },
};