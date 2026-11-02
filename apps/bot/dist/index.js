"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = require("@crystalaid/database");
const config_1 = require("@crystalaid/config");
const commands_1 = require("./commands");
const deployCommands_1 = require("./deployCommands");
const crystalEmbed_1 = require("./embeds/crystalEmbed");
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
        // 1. Button interactions (e.g. Quick Stats)
        if (interaction.isButton()) {
            if (interaction.customId === 'btn_quick_stats') {
                try {
                    const targetGuildId = interaction.guildId || '1100000000000000001';
                    const dbUser = await database_1.prisma.user.findUnique({
                        where: { discordId: interaction.user.id },
                        include: {
                            guildMembers: {
                                where: { guild: { discordGuildId: targetGuildId } },
                            },
                        },
                    });
                    if (!dbUser || !dbUser.guildMembers[0]) {
                        const embed = (0, crystalEmbed_1.createCrystalEmbed)('Profile Not Initialized', 'Launch the Activity to start earning XP and crystals!');
                        return interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
                    }
                    const member = dbUser.guildMembers[0];
                    const prog = (0, config_1.calculateLevelProgression)(member.xp);
                    const embed = (0, crystalEmbed_1.createCrystalEmbed)(`${interaction.user.username}'s Quick Stats`, `⚡ **Level ${member.level}** (${prog.progressPercent}% to Lvl ${member.level + 1})\n💎 **Total XP:** ${member.xp.toLocaleString()}\n🔥 **Streak:** ${member.currentStreak} Days\n🔷 **Crystals:** ${dbUser.coins.toLocaleString()}`);
                    return interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
                }
                catch (btnErr) {
                    console.error('Error handling button interaction:', btnErr);
                    return interaction.reply({ content: 'Could not fetch your stats right now.', flags: discord_js_1.MessageFlags.Ephemeral });
                }
            }
            return;
        }
        // 2. Slash command interactions
        if (!interaction.isChatInputCommand())
            return;
        try {
            await (0, commands_1.handleCommand)(interaction);
        }
        catch (error) {
            console.error('Error executing interaction:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: discord_js_1.MessageFlags.Ephemeral });
            }
            else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: discord_js_1.MessageFlags.Ephemeral });
            }
        }
    });
    await client.login(token);
}
startBot().catch((err) => {
    console.error('Failed to launch CrystalAid Bot:', err);
});
//# sourceMappingURL=index.js.map