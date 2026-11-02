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

export function createActivityLaunchButton(): ActionRowBuilder<ButtonBuilder> {
  const appUrl = process.env.APP_URL || 'https://noievroninoravoniaseofioerfovarnoonvavraonirvwjifvediopnosdvonWEFPJQ.bothost.tech';

  const launchBtn = new ButtonBuilder()
    .setLabel('Launch CrystalAid Activity')
    .setEmoji('💎')
    .setStyle(ButtonStyle.Link)
    .setURL(appUrl);

  const statsBtn = new ButtonBuilder()
    .setCustomId('btn_quick_stats')
    .setLabel('View My Stats')
    .setEmoji('⚡')
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(launchBtn, statsBtn);
}
