module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        const logger = client.logger;
        
if (interaction.user && !interaction.user.bot) {
            try {
                const usersData = client.dataManager.getData('users.json') || {};
                if (!usersData[interaction.user.id]) {
                    usersData[interaction.user.id] = {};
                }
                usersData[interaction.user.id].lastActive = new Date().toISOString();
                client.dataManager.saveData('users.json', usersData);
            } catch (error) {
                logger.error('Error updating user activity:', error);
            }
        }
        
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            
            if (!command) {
                logger.warning(`Unknown command: ${interaction.commandName}`);
                return;
            }

            try {
                logger.info(`Command executed: /${interaction.commandName} by ${interaction.user.tag}`);
                await command.execute(interaction);
            } catch (error) {
                logger.error(`Command error in /${interaction.commandName}: ${error.message}`);
                
                const errorEmbed = {
                    color: 0xff4444,
                    title: '❌ Something went wrong!',
                    description: 'There was an error executing this command.',
                    fields: [
                        {
                            name: 'What to do?',
                            value: 'Please try again later or contact support if the issue persists.'
                        }
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: 'Bot developed by LordK • Error Handler'
                    }
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        } 
        else if (interaction.isButton()) {
            // Manejar botones de clase
            if (interaction.customId.startsWith('class_')) {
                const button = client.buttons.get('class_');
                if (button) {
                    try {
                        await button.execute(interaction, client);
                    } catch (error) {
                        logger.error(`Class button error: ${error.message}`);
                        await interaction.reply({ 
                            content: '❌ Error processing class selection.', 
                            ephemeral: true 
                        });
                    }
                }
            }
            // Manejar botones de exploración (NUEVO)
            else if (interaction.customId.startsWith('explore_')) {
                const button = client.buttons.get('explore_');
                if (button) {
                    try {
                        await button.execute(interaction, client);
                    } catch (error) {
                        logger.error(`Explore button error: ${error.message}`);
                    }
                }
            }
            // === [ INICIO: Nuevos botones de la tienda ] ===
            else if (interaction.customId === 'shop_show_all') {
                const button = client.buttons.get('shop_show_all');
                if (button) {
                    try {
                        await button.execute(interaction, client);
                    } catch (error) {
                        logger.error(`Shop show all error: ${error.message}`);
                    }
                }
            }
            else if (interaction.customId === 'shop_my_class') {
                const button = client.buttons.get('shop_my_class');
                if (button) {
                    try {
                        await button.execute(interaction, client);
                    } catch (error) {
                        logger.error(`Shop my class error: ${error.message}`);
                    }
                }
            }
            // === [ FIN: Nuevos botones de la tienda ] ===
            // Manejar botón de soporte
            else if (interaction.customId === 'get_support') {
                const button = client.buttons.get('get_support');
                if (button) {
                    try {
                        await button.execute(interaction, client);
                    } catch (error) {
                        logger.error(`Support button error: ${error.message}`);
                    }
                }
            }

// En el bloque de interacciones de botones, añade:
else if (interaction.customId.startsWith('inventory_')) {
    const button = client.buttons.get('inventory_');
    if (button) {
        try {
            await button.execute(interaction, client);
        } catch (error) {
            logger.error(`Inventory button error: ${error.message}`);
        }
    }
}
            // Manejar otros botones
            else {
                const buttonName = interaction.customId.split('_')[0];
                const button = client.buttons.get(buttonName);
                if (button) {
                    try {
                        await button.execute(interaction, client);
                    } catch (error) {
                        logger.error(`Button error: ${error.message}`);
                    }
                }
            }
        }
        else if (interaction.isStringSelectMenu()) {
            const selectMenu = client.selectMenus.get(interaction.customId);
            if (selectMenu) {
                try {
                    await selectMenu.execute(interaction, client);
                } catch (error) {
                    logger.error(`Select menu error: ${error.message}`);
                }
            }
        }
    }
};