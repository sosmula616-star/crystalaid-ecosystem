"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRYSTAL_BRAND_COLOR = void 0;
exports.getAppUrl = getAppUrl;
exports.isUrlValidForDiscordButton = isUrlValidForDiscordButton;
exports.getActivityLinkText = getActivityLinkText;
exports.createCrystalEmbed = createCrystalEmbed;
exports.createActivityLaunchButton = createActivityLaunchButton;
const discord_js_1 = require("discord.js");
exports.CRYSTAL_BRAND_COLOR = 0x38bdf8; // Glacial cyan
const DEFAULT_ACTIVITY_URL = 'https://noievroninoravoniaseofioerfovarnoonvavraonirvwjifvediopnosdvonWEFPJQ.bothost.tech';
function getAppUrl() {
    let rawUrl = (process.env.APP_URL || process.env.APP_DOMAIN || DEFAULT_ACTIVITY_URL).trim();
    rawUrl = rawUrl.replace(/^["']|["']$/g, '').trim();
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        rawUrl = `https://${rawUrl}`;
    }
    return rawUrl;
}
/**
 * Check if the hostname of the URL has any label exceeding 63 characters (RFC 1035).
 * Discord API strictly validates this for Button Link URLs.
 */
function isUrlValidForDiscordButton(url) {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return false;
        }
        if (parsed.hostname.length > 253) {
            return false;
        }
        const labels = parsed.hostname.split('.');
        return labels.length > 0 && labels.every((label) => label.length > 0 && label.length <= 63);
    }
    catch {
        return false;
    }
}
/**
 * Returns a clickable markdown link to the app URL.
 * Used in embed descriptions when the URL cannot be placed on a Discord button.
 */
function getActivityLinkText() {
    const appUrl = getAppUrl();
    if (isUrlValidForDiscordButton(appUrl)) {
        return ''; // Button is available, no need to duplicate in text
    }
    return `\n\n🔗 **[Open CrystalAid Web App](${appUrl})**`;
}
function createCrystalEmbed(title, description, includeLinkIfNoButton = false) {
    const linkText = includeLinkIfNoButton ? getActivityLinkText() : '';
    const finalDesc = linkText ? `${description}${linkText}` : description;
    return new discord_js_1.EmbedBuilder()
        .setColor(exports.CRYSTAL_BRAND_COLOR)
        .setTitle(`💎 ${title}`)
        .setDescription(finalDesc)
        .setFooter({
        text: 'CrystalAid Ecosystem • Discord Native Activity',
    })
        .setTimestamp();
}
/**
 * Creates an ActionRow with buttons.
 * If the APP_URL domain has labels >63 chars (or is invalid for Discord Link Button),
 * the Link button is omitted to prevent DiscordAPIError[50035] (URL_TYPE_INVALID_URL),
 * and only the secondary interactive button is sent.
 */
function createActivityLaunchButton() {
    const appUrl = getAppUrl();
    const statsBtn = new discord_js_1.ButtonBuilder()
        .setCustomId('btn_quick_stats')
        .setLabel('View My Stats')
        .setEmoji('⚡')
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    if (isUrlValidForDiscordButton(appUrl)) {
        const launchBtn = new discord_js_1.ButtonBuilder()
            .setLabel('Launch CrystalAid Activity')
            .setEmoji('💎')
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setURL(appUrl);
        return new discord_js_1.ActionRowBuilder().addComponents(launchBtn, statsBtn);
    }
    // URL too long for Discord button — return row with stats button only
    return new discord_js_1.ActionRowBuilder().addComponents(statsBtn);
}
//# sourceMappingURL=crystalEmbed.js.map