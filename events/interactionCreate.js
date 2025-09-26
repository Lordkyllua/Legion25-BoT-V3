[file name]: interactionCreate.js
[file content begin]
module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        const logger = client.logger;
        
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
            // Manejar botones de exploración
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
            // === [ CORREGIDO: Botones de tienda con manejo de errores mejorado ] ===
            else if (interaction.customId === 'shop_show_all') {
                const button = client.buttons.get('shop_show_all');
                if (button) {
                    try {
                        await button.execute(interaction, client);
                    } catch (error) {
                        logger.error(`Shop show all error: ${error.message}`);
                        if (interaction.deferred || interaction.replied) {
                            await interaction.editReply({ 
                                content: '❌ Error loading all items.', 
                                components: [] 
                            });
                        } else {
                            await interaction.reply({ 
                                content: '❌ Error loading all items.', 
                                ephemeral: true 
                            });
                        }
                    }
                } else {
                    logger.warning(`Button shop_show_all not found in collection`);
                }
            }
            else if (interaction.customId === 'shop_my_class') {
                const button = client.buttons.get('shop_my_class');
                if (button) {
                    try {
                        await button.execute(interaction, client);
                    } catch (error) {
                        logger.error(`Shop my class error: ${error.message}`);
                        if (interaction.deferred || interaction.replied) {
                            await interaction.editReply({ 
                                content: '❌ Error filtering items by class.', 
                                components: [] 
                            });
                        } else {
                            await interaction.reply({ 
                                content: '❌ Error filtering items by class.', 
                                ephemeral: true 
                            });
                        }
                    }
                } else {
                    logger.warning(`Button shop_my_class not found in collection`);
                }
            }
            // === [ FIN: Botones de tienda ] ===
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
            // === [ CORREGIDO: Manejo específico para shopCategory ] ===
            if (interaction.customId === 'shopCategory') {
                const selectMenu = client.selectMenus.get('shopCategory');
                if (selectMenu) {
                    try {
                        await selectMenu.execute(interaction, client);
                    } catch (error) {
                        logger.error(`Shop category error: ${error.message}`);
                        if (interaction.deferred || interaction.replied) {
                            await interaction.editReply({ 
                                content: '❌ Error loading category items.', 
                                components: [] 
                            });
                        } else {
                            await interaction.reply({ 
                                content: '❌ Error loading category items.', 
                                ephemeral: true 
                            });
                        }
                    }
                } else {
                    logger.warning(`Select menu shopCategory not found in collection`);
                }
            }
            // Manejar otros select menus existentes
            else {
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
    }
};
[file content end]