import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const CRYSTAL_BRAND_COLOR = 0x38bdf8; // Glacial cyan

export function createCrystalEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(CRYSTAL_BRAND_COLOR)
    .setTitle(`💎 ${title}`)
    .setDescription(description)
    .setFooter({
      text: 'CrystalAid Ecosystem • Discord Native Activity',
    })
    .setTimestamp();
}

const DEFAULT_ACTIVITY_URL = 'https://noievroninoravoniaseofioerfovarnoonvavraonirvwjifvediopnosdvonWEFPJQ.bothost.tech';

export function getSanitizedAppUrl(): string {
  let rawUrl = (process.env.APP_URL || process.env.APP_DOMAIN || DEFAULT_ACTIVITY_URL).trim();
  rawUrl = rawUrl.replace(/^["']|["']$/g, '').trim();

  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }

  try {
    const parsed = new URL(rawUrl);
    return parsed.toString();
  } catch {
    return DEFAULT_ACTIVITY_URL;
  }
}

export function createActivityLaunchButton(): ActionRowBuilder<ButtonBuilder> {
  const validUrl = getSanitizedAppUrl();

  const launchBtn = new ButtonBuilder()
    .setLabel('Launch CrystalAid Activity')
    .setEmoji('💎')
    .setStyle(ButtonStyle.Link)
    .setURL(validUrl);

  const statsBtn = new ButtonBuilder()
    .setCustomId('btn_quick_stats')
    .setLabel('View My Stats')
    .setEmoji('⚡')
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(launchBtn, statsBtn);
}
