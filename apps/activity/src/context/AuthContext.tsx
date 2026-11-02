import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, GuildContext, AuthSessionResponse, WsServerMessage } from '@crystalaid/types';
import { api } from '../services/apiClient';
import { discordService } from '../services/discordSdk';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  guild: GuildContext | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateUserBalance: (deltaCoins: number) => void;
  updateUserCosmetics: (equippedFrame?: string | null, equippedBadge?: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [guild, setGuild] = useState<GuildContext | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { success, info } = useToast();

  const refreshProfile = useCallback(async () => {
    try {
      const updatedUser = await api.get<UserProfile>('/api/auth/me');
      setUser(updatedUser);
    } catch (err: any) {
      console.warn('Failed to refresh user profile:', err);
    }
  }, []);

  const updateUserBalance = useCallback((deltaCoins: number) => {
    setUser((prev) => (prev ? { ...prev, coins: prev.coins + deltaCoins } : null));
  }, []);

  const updateUserCosmetics = useCallback(
    async (equippedFrame?: string | null, equippedBadge?: string | null) => {
      try {
        const res = await api.patch<{ equippedFrame: string | null; equippedBadge: string | null }>(
          '/api/users/me/cosmetics',
          { equippedFrame, equippedBadge }
        );
        setUser((prev) =>
          prev
            ? {
                ...prev,
                equippedFrame: res.equippedFrame,
                equippedBadge: res.equippedBadge,
              }
            : null
        );
        success('Cosmetics updated successfully!', 'Inventory');
      } catch (err: any) {
        throw err;
      }
    },
    [success]
  );

  useEffect(() => {
    let ws: WebSocket | null = null;

    async function initAuth() {
      setIsLoading(true);
      setError(null);
      try {
        const { code, guildId } = await discordService.init();

        const authData = await api.post<AuthSessionResponse>('/api/auth/discord/token', {
          code,
          guildId,
        });

        api.setAuth(authData.token, authData.guild.discordGuildId);
        setToken(authData.token);
        setUser(authData.user);
        setGuild(authData.guild);

        // Connect WebSocket
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.host;
        const wsUrl = import.meta.env.VITE_WS_URL || `${wsProtocol}//${wsHost}/ws`;

        try {
          ws = new WebSocket(wsUrl);
          ws.onopen = () => {
            ws?.send(
              JSON.stringify({
                type: 'SUBSCRIBE',
                guildId: authData.guild.discordGuildId,
                token: authData.token,
              })
            );
          };

          ws.onmessage = (event) => {
            try {
              const msg: WsServerMessage = JSON.parse(event.data);
              if (msg.type === 'LEVEL_UP') {
                success(`Level Up! You reached Level ${msg.newLevel}! (+${msg.bonusCoins} Crystals)`, 'Celebration');
                refreshProfile();
              } else if (msg.type === 'NOTIFICATION') {
                info(msg.message, msg.title);
              }
            } catch (e) {}
          };
        } catch (wsErr) {
          console.warn('WebSocket connection error (non-fatal):', wsErr);
        }
      } catch (err: any) {
        console.error('Authentication error:', err);
        setError(err.message || 'Failed to authenticate with CrystalAid');
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      if (ws) ws.close();
    };
  }, [refreshProfile, success, info]);

  return (
    <AuthContext.Provider
      value={{
        user,
        guild,
        token,
        isLoading,
        error,
        refreshProfile,
        updateUserBalance,
        updateUserCosmetics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
