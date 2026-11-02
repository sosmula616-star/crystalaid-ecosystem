import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
export declare const CRYSTAL_BRAND_COLOR = 3718648;
export declare function getAppUrl(): string;
/**
 * Check if the hostname of the URL has any label exceeding 63 characters (RFC 1035).
 * Discord API strictly validates this for Button Link URLs.
 */
export declare function isUrlValidForDiscordButton(url: string): boolean;
/**
 * Returns a clickable markdown link to the app URL.
 * Used in embed descriptions when the URL cannot be placed on a Discord button.
 */
export declare function getActivityLinkText(): string;
export declare function createCrystalEmbed(title: string, description: string, includeLinkIfNoButton?: boolean): EmbedBuilder;
/**
 * Creates an ActionRow with buttons.
 * If the APP_URL domain has labels >63 chars (or is invalid for Discord Link Button),
 * the Link button is omitted to prevent DiscordAPIError[50035] (URL_TYPE_INVALID_URL),
 * and only the secondary interactive button is sent.
 */
export declare function createActivityLaunchButton(): ActionRowBuilder<ButtonBuilder>;
//# sourceMappingURL=crystalEmbed.d.ts.map