module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client, logger) {
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
      const button = client.buttons.get(interaction.customId.split('_')[0]);
      if (button) {
        try {
          await button.execute(interaction, client);
        } catch (error) {
          logger.error(`Button error: ${error.message}`);
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