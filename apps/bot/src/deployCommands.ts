import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import { commands } from './commands';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

export async function deployCommands() {
  if (!token || token.includes('placeholder')) {
    console.log('⚠️ Skipping Discord REST slash command deployment: DISCORD_BOT_TOKEN is not set or is placeholder.');
    return;
  }

  if (!clientId) {
    console.warn('⚠️ Missing DISCORD_CLIENT_ID in .env');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('🚀 Deploying CrystalAid slash commands to Discord API...');
    const body = commands.map((c) => c.toJSON());
    await rest.put(Routes.applicationCommands(clientId), { body });
    console.log(`✅ Successfully registered ${commands.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Failed to register Discord slash commands:', error);
  }
}

if (require.main === module) {
  deployCommands();
}
