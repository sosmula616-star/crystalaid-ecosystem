"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const commands_1 = require("./commands");
const deployCommands_1 = require("./deployCommands");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const token = process.env.DISCORD_BOT_TOKEN;
async function startBot() {
    if (!token || token.includes('placeholder')) {
        console.log('🤖 [CrystalAid Bot] DISCORD_BOT_TOKEN is not configured or in placeholder mode.');
        console.log('ℹ️ Bot process will stand by. Configure DISCORD_BOT_TOKEN in .env to connect to Discord Gateway.');
        return;
    }
    const client = new discord_js_1.Client({
        intents: [
            discord_js_1.GatewayIntentBits.Guilds,
            discord_js_1.GatewayIntentBits.GuildMessages,
            discord_js_1.GatewayIntentBits.GuildVoiceStates,
        ],
    });
    client.once(discord_js_1.Events.ClientReady, async (readyClient) => {
        console.log(`🤖 CrystalAid Bot logged in as ${readyClient.user.tag}`);
        await (0, deployCommands_1.deployCommands)();
    });
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand())
            return;
        try {
            await (0, commands_1.handleCommand)(interaction);
        }
        catch (error) {
            console.error('Error executing interaction:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            }
            else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });
    await client.login(token);
}
startBot().catch((err) => {
    console.error('Failed to launch CrystalAid Bot:', err);
});
//# sourceMappingURL=index.js.map