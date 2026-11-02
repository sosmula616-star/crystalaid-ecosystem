import { DiscordSDK } from '@discord/embedded-app-sdk';

const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID || '1100000000000000000';

class DiscordService {
  private sdk: DiscordSDK | null = null;
  public isMockMode = false;

  async init(): Promise<{ code: string; guildId: string; channelId: string }> {
    const isInsideDiscordIframe = window.parent !== window;

    if (!isInsideDiscordIframe || import.meta.env.VITE_MOCK_DISCORD === 'true') {
      console.log('🎮 [CrystalAid] Running in Standalone Browser / Simulation Mode');
      this.isMockMode = true;
      return {
        code: 'MOCK_CODE',
        guildId: '1100000000000000001',
        channelId: '1100000000000000010',
      };
    }

    try {
      this.sdk = new DiscordSDK(clientId);
      await this.sdk.ready();

      const { code } = await this.sdk.commands.authorize({
        client_id: clientId,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: ['identify', 'guilds', 'guilds.members.read'],
      });

      return {
        code,
        guildId: this.sdk.guildId || '1100000000000000001',
        channelId: this.sdk.channelId || '1100000000000000010',
      };
    } catch (err) {
      console.warn('⚠️ Discord Embedded App SDK initialization failed, falling back to mock mode:', err);
      this.isMockMode = true;
      return {
        code: 'MOCK_CODE',
        guildId: '1100000000000000001',
        channelId: '1100000000000000010',
      };
    }
  }

  getSdk() {
    return this.sdk;
  }
}

export const discordService = new DiscordService();
