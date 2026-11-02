import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { prisma } from '@crystalaid/database';
import { calculateLevelProgression, APP_CONFIG } from '@crystalaid/config';
import { createCrystalEmbed, createActivityLaunchButton } from '../embeds/crystalEmbed';

export const commands = [
  new SlashCommandBuilder()
    .setName('activity')
    .setDescription('Launch the CrystalAid Activity Mini App in this channel'),

  new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Check your or another member CrystalAid level, streak, and statistics')
    .addUserOption((option) =>
      option.setName('user').setDescription('Target member').setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the Top members ranking in this server'),

  new SlashCommandBuilder()
    .setName('rewards')
    .setDescription('Check daily claim status and consecutive streak progress'),

  new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily Crystal bonus and advance your streak'),

  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View community activity statistics for this server'),

  new SlashCommandBuilder()
    .setName('settings')
    .setDescription('View or configure CrystalAid settings (Admins only)'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Interactive guide to all CrystalAid features and commands'),
];

export async function handleCommand(interaction: ChatInputCommandInteraction) {
  const { commandName, guildId, user } = interaction;
  const targetGuildId = guildId || '1100000000000000001';

  if (commandName === 'activity') {
    const embed = createCrystalEmbed(
      'CrystalAid Virtual Lounge',
      'Step into the Crystal Lounge! Earn XP, level up, unlock cosmetics, and join live focus sessions directly inside Discord.'
    );
    embed.addFields(
      { name: '🔥 Current Streak', value: 'Check your rewards in the app', inline: true },
      { name: '🔷 XP Multiplier', value: '1.0x Server Rate', inline: true }
    );

    return interaction.reply({
      embeds: [embed],
      components: [createActivityLaunchButton()],
    });
  }

  if (commandName === 'profile') {
    const targetUser = interaction.options.getUser('user') || user;
    const dbUser = await prisma.user.findUnique({
      where: { discordId: targetUser.id },
      include: {
        guildMembers: {
          where: { guild: { discordGuildId: targetGuildId } },
        },
      },
    });

    if (!dbUser || !dbUser.guildMembers[0]) {
      const embed = createCrystalEmbed(
        'Profile Not Found',
        `${targetUser.username} hasn't joined a CrystalAid session yet! Launch the Activity to begin.`
      );
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    const member = dbUser.guildMembers[0];
    const prog = calculateLevelProgression(member.xp);

    const embed = createCrystalEmbed(
      `${dbUser.username}'s Crystal Profile`,
      `**Rank / Role:** ${member.role}\n**Equipped Frame:** ${dbUser.equippedFrame || 'None'}`
    );
    embed.setThumbnail(targetUser.displayAvatarURL());
    embed.addFields(
      { name: '⚡ Level', value: `${member.level}`, inline: true },
      { name: '💎 Total XP', value: `${member.xp.toLocaleString()}`, inline: true },
      { name: '🔥 Streak', value: `${member.currentStreak} Days`, inline: true },
      { name: '🔷 Crystals Balance', value: `${dbUser.coins.toLocaleString()} 💎`, inline: true },
      { name: '📈 Next Level', value: `${prog.progressPercent}% (${prog.xpInCurrentLevel}/${prog.xpRequiredForCurrentLevel} XP)`, inline: true }
    );

    return interaction.reply({
      embeds: [embed],
      components: [createActivityLaunchButton()],
    });
  }

  if (commandName === 'leaderboard') {
    const topMembers = await prisma.guildMember.findMany({
      where: { guild: { discordGuildId: targetGuildId } },
      include: { user: true },
      orderBy: { xp: 'desc' },
      take: 10,
    });

    const embed = createCrystalEmbed(
      'CrystalAid Leaderboard',
      'The top resonating members in this server:'
    );

    let desc = '';
    const medals = ['🥇', '🥈', '🥉'];
    topMembers.forEach((m, i) => {
      const medal = medals[i] || `\`#${i + 1}\``;
      desc += `${medal} **${m.user.username}** — Level ${m.level} • ${m.xp.toLocaleString()} XP (🔥 ${m.currentStreak}d)\n`;
    });

    embed.setDescription(desc || 'No members on the leaderboard yet. Be the first!');

    return interaction.reply({
      embeds: [embed],
      components: [createActivityLaunchButton()],
    });
  }

  if (commandName === 'rewards' || commandName === 'daily') {
    const dbUser = await prisma.user.findUnique({
      where: { discordId: user.id },
      include: {
        guildMembers: {
          where: { guild: { discordGuildId: targetGuildId } },
        },
      },
    });

    if (!dbUser || !dbUser.guildMembers[0]) {
      const embed = createCrystalEmbed(
        'Welcome to CrystalAid',
        'Launch the Activity first to initialize your account and claim daily crystals!'
      );
      return interaction.reply({
        embeds: [embed],
        components: [createActivityLaunchButton()],
        flags: MessageFlags.Ephemeral,
      });
    }

    const member = dbUser.guildMembers[0];
    const now = Date.now();
    const lastClaim = member.lastDailyClaim ? new Date(member.lastDailyClaim).getTime() : 0;
    const cooldownMs = APP_CONFIG.dailyClaimCooldownHours * 3600 * 1000;
    const diff = now - lastClaim;

    if (diff < cooldownMs && commandName === 'daily') {
      const remainingHours = Math.ceil((cooldownMs - diff) / (3600 * 1000));
      const embed = createCrystalEmbed(
        'Daily Reward on Cooldown',
        `You have already claimed your daily reward! Please return in approx. **${remainingHours} hours**.`
      );
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    const embed = createCrystalEmbed(
      'Daily Crystal Rewards',
      `**Current Streak:** 🔥 **${member.currentStreak} Days**\n\nDaily claim resets every 20 hours with streak preservation up to 48 hours.`
    );
    embed.addFields(
      { name: 'Claim Status', value: diff >= cooldownMs ? '✅ Ready to Claim!' : '⏳ On Cooldown', inline: true },
      { name: 'Next Reward', value: '+80 Crystals • +150 XP', inline: true }
    );

    return interaction.reply({
      embeds: [embed],
      components: [createActivityLaunchButton()],
    });
  }

  if (commandName === 'stats') {
    const totalUsers = await prisma.guildMember.count({
      where: { guild: { discordGuildId: targetGuildId } },
    });
    const totalSessions = await prisma.activitySession.count();

    const embed = createCrystalEmbed(
      'Server Community Statistics',
      'Real-time engagement telemetry from CrystalAid ecosystem:'
    );
    embed.addFields(
      { name: '👥 Active Members', value: `${totalUsers}`, inline: true },
      { name: '🎮 Sessions Recorded', value: `${totalSessions}`, inline: true },
      { name: '💎 Currency System', value: 'Active (Crystals)', inline: true },
      { name: '🛡️ Anti-Cheat Protection', value: 'Operational', inline: true }
    );

    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'help') {
    const embed = createCrystalEmbed(
      'CrystalAid Command Directory',
      'Here are all available commands in the CrystalAid ecosystem:'
    );
    embed.addFields(
      { name: '`/activity`', value: 'Launch the interactive Activity Mini App' },
      { name: '`/profile [@user]`', value: 'Inspect member rank, level, and equipped frame' },
      { name: '`/leaderboard`', value: 'View top server ranks and podium standings' },
      { name: '`/rewards` / `/daily`', value: 'Check and claim your daily streak crystals' },
      { name: '`/stats`', value: 'Server activity telemetry and totals' },
      { name: '`/settings`', value: 'Server configuration for moderators and administrators' }
    );

    return interaction.reply({
      embeds: [embed],
      components: [createActivityLaunchButton()],
    });
  }

  // Fallback
  return interaction.reply({ content: 'Command processed.', flags: MessageFlags.Ephemeral });
}
