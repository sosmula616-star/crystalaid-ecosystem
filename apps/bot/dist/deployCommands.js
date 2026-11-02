"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployCommands = deployCommands;
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const commands_1 = require("./commands");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
async function deployCommands() {
    if (!token || token.includes('placeholder')) {
        console.log('⚠️ Skipping Discord REST slash command deployment: DISCORD_BOT_TOKEN is not set or is placeholder.');
        return;
    }
    if (!clientId) {
        console.warn('⚠️ Missing DISCORD_CLIENT_ID in .env');
        return;
    }
    const rest = new discord_js_1.REST({ version: '10' }).setToken(token);
    try {
        console.log('🚀 Deploying CrystalAid slash commands to Discord API...');
        // Fetch existing commands to preserve Discord Activity Entry Point commands (avoids error 50240)
        let existingCommands = [];
        try {
            const fetched = await rest.get(discord_js_1.Routes.applicationCommands(clientId));
            if (Array.isArray(fetched)) {
                existingCommands = fetched;
            }
        }
        catch (getErr) {
            console.warn('⚠️ Note when querying existing commands:', getErr?.message || getErr);
        }
        const body = commands_1.commands.map((c) => c.toJSON());
        // Type 4 is ApplicationCommandType.PrimaryEntryPoint (used by Discord Activities)
        const entryPoints = existingCommands.filter((c) => c.type === 4);
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
        await rest.put(discord_js_1.Routes.applicationCommands(clientId), { body });
        console.log(`✅ Successfully registered application commands (${body.length} total, including preserved Entry Point).`);
    }
    catch (error) {
        console.error('❌ Failed to register Discord slash commands:', error);
    }
}
if (require.main === module) {
    deployCommands();
}
//# sourceMappingURL=deployCommands.js.map