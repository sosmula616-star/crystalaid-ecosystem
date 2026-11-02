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

    // Fetch existing commands to preserve Discord Activity Entry Point commands (avoids error 50240)
    let existingCommands: any[] = [];
    try {
      const fetched = await rest.get(Routes.applicationCommands(clientId));
      if (Array.isArray(fetched)) {
        existingCommands = fetched;
      }
    } catch (getErr: any) {
      console.warn('⚠️ Note when querying existing commands:', getErr?.message || getErr);
    }

    const body: any[] = commands.map((c) => c.toJSON());

    // Type 4 is ApplicationCommandType.PrimaryEntryPoint (used by Discord Activities)
    const entryPoints = existingCommands.filter((c: any) => c.type === 4);
    for (const ep of entryPoints) {
      console.log(`💎 Preserving Activity Entry Point command: "${ep.name}" (ID: ${ep.id})`);
      body.push({
        id: ep.id,
        name: ep.name,
        description: ep.description || 'Launch Activity',
        type: ep.type,
        ...(ep.handler !== undefined ? { handler: ep.handler } : {}),
        ...(ep.integration_types ? { integration_types: ep.integration_types } : {}),
        ...(ep.contexts ? { contexts: ep.contexts } : {}),
      });
    }

    await rest.put(Routes.applicationCommands(clientId), { body });
    console.log(`✅ Successfully registered application commands (${body.length} total, including preserved Entry Point).`);
  } catch (error) {
    console.error('❌ Failed to register Discord slash commands:', error);
  }
}

if (require.main === module) {
  deployCommands();
}
