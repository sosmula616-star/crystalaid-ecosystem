import { Client, GatewayIntentBits, Events, MessageFlags } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from '@crystalaid/database';
import { calculateLevelProgression } from '@crystalaid/config';
import { handleCommand } from './commands';
import { deployCommands } from './deployCommands';
import { createCrystalEmbed } from './embeds/crystalEmbed';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const token = process.env.DISCORD_BOT_TOKEN;

async function startBot() {
  if (!token || token.includes('placeholder')) {
    console.log('🤖 [CrystalAid Bot] DISCORD_BOT_TOKEN is not configured or in placeholder mode.');
    console.log('ℹ️ Bot process will stand by. Configure DISCORD_BOT_TOKEN in .env to connect to Discord Gateway.');
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`🤖 CrystalAid Bot logged in as ${readyClient.user.tag}`);
    await deployCommands();
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    // 1. Button interactions (e.g. Quick Stats)
    if (interaction.isButton()) {
      if (interaction.customId === 'btn_quick_stats') {
        try {
          const targetGuildId = interaction.guildId || '1100000000000000001';
          const dbUser = await prisma.user.findUnique({
            where: { discordId: interaction.user.id },
            include: {
              guildMembers: {
                where: { guild: { discordGuildId: targetGuildId } },
              },
            },
          });
          if (!dbUser || !dbUser.guildMembers[0]) {
            const embed = createCrystalEmbed('Profile Not Initialized', 'Launch the Activity to start earning XP and crystals!');
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
          }
          const member = dbUser.guildMembers[0];
          const prog = calculateLevelProgression(member.xp);
          const embed = createCrystalEmbed(
            `${interaction.user.username}'s Quick Stats`,
            `⚡ **Level ${member.level}** (${prog.progressPercent}% to Lvl ${member.level + 1})\n💎 **Total XP:** ${member.xp.toLocaleString()}\n🔥 **Streak:** ${member.currentStreak} Days\n🔷 **Crystals:** ${dbUser.coins.toLocaleString()}`
          );
          return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (btnErr) {
          console.error('Error handling button interaction:', btnErr);
          return interaction.reply({ content: 'Could not fetch your stats right now.', flags: MessageFlags.Ephemeral });
        }
      }
      return;
    }

    // 2. Slash command interactions
    if (!interaction.isChatInputCommand()) return;
    try {
      await handleCommand(interaction);
    } catch (error) {
      console.error('Error executing interaction:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
      }
    }
  });

  await client.login(token);
}

startBot().catch((err) => {
  console.error('Failed to launch CrystalAid Bot:', err);
});
