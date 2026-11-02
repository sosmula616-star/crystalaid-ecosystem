"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRYSTAL_BRAND_COLOR = void 0;
exports.createCrystalEmbed = createCrystalEmbed;
exports.createActivityLaunchButton = createActivityLaunchButton;
const discord_js_1 = require("discord.js");
exports.CRYSTAL_BRAND_COLOR = 0x38bdf8; // Glacial cyan
function createCrystalEmbed(title, description) {
    return new discord_js_1.EmbedBuilder()
        .setColor(exports.CRYSTAL_BRAND_COLOR)
        .setTitle(`💎 ${title}`)
        .setDescription(description)
        .setFooter({
        text: 'CrystalAid Ecosystem • Discord Native Activity',
    })
        .setTimestamp();
}
function createActivityLaunchButton() {
    const appUrl = process.env.APP_URL || 'https://noievroninoravoniaseofioerfovarnoonvavraonirvwjifvediopnosdvonWEFPJQ.bothost.tech';
    const launchBtn = new discord_js_1.ButtonBuilder()
        .setLabel('Launch CrystalAid Activity')
        .setEmoji('💎')
        .setStyle(discord_js_1.ButtonStyle.Link)
        .setURL(appUrl);
    const statsBtn = new discord_js_1.ButtonBuilder()
        .setCustomId('btn_quick_stats')
        .setLabel('View My Stats')
        .setEmoji('⚡')
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    return new discord_js_1.ActionRowBuilder().addComponents(launchBtn, statsBtn);
}
//# sourceMappingURL=crystalEmbed.js.map