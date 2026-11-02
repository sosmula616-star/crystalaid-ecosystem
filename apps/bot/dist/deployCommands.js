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
        const body = commands_1.commands.map((c) => c.toJSON());
        await rest.put(discord_js_1.Routes.applicationCommands(clientId), { body });
        console.log(`✅ Successfully registered ${commands_1.commands.length} application (/) commands.`);
    }
    catch (error) {
        console.error('❌ Failed to register Discord slash commands:', error);
    }
}
if (require.main === module) {
    deployCommands();
}
//# sourceMappingURL=deployCommands.js.map