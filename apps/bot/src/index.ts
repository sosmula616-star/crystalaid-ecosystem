import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import { handleCommand } from './commands';
import { deployCommands } from './deployCommands';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const token = process.env.DISCORD_BOT_TOKEN;

async function startBot() {
  if (!token || token.includes('placeholder')) {
    console.log('🤖 [CrystalAid Bot] DISCORD_BOT_TOKEN is not configured or in placeholder mode.');
    console.log('ℹ️ Bot process will stand by. Configure DISCORD_BOT_TOKEN in .env to connect to Discord Gateway.');
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`🤖 CrystalAid Bot logged in as ${readyClient.user.tag}`);
    await deployCommands();
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      await handleCommand(interaction);
    } catch (error) {
      console.error('Error executing interaction:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  });

  await client.login(token);
}

startBot().catch((err) => {
  console.error('Failed to launch CrystalAid Bot:', err);
});
