import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, useAuthStore } from './useAuthStore';
import { useSocialStore } from './useSocialStore';

export interface ClanMember {
  id: string;
  name: string;
  role: 'Leader' | 'Officer' | 'Member';
  status: 'ONLINE' | 'IN_MATCH' | 'OFFLINE';
  avatarUrl: string;
  joinedAt: string;
}

export interface ClanChatMessage {
  id: string;
  sender: string;
  role: string;
  content: string;
  time: string;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string;
  emblem: string;
  level: number;
  trophies: number;
  founderId: string;
  founderName: string;
  createdAt: string;
  members: ClanMember[];
  isCustomClan?: boolean;
}

// Criteria to create an official Clan
export const CLAN_CREATION_CRITERIA = {
  MIN_LEVEL: 2,
  COIN_COST: 150,
  MIN_RANK: 25,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 20,
  MIN_TAG_LENGTH: 2,
  MAX_TAG_LENGTH: 5
};

const DEFAULT_CLANS: Clan[] = [
  {
    id: 'clan_nexus',
    name: 'Nexus Legions',
    tag: 'NX',
    description: 'Global division commanding competitive MOBA ladders and tactical brackets.',
    emblem: '⚔️',
    level: 15,
    trophies: 2850,
    founderId: 'pilot_genesis',
    founderName: 'Genesis_Prime',
    createdAt: '2026-01-10',
    members: [
      { id: 'm1', name: 'Genesis_Prime', role: 'Leader', status: 'ONLINE', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Genesis', joinedAt: '2026-01-10' },
      { id: 'm2', name: 'Neon_Specter', role: 'Officer', status: 'ONLINE', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Specter', joinedAt: '2026-01-14' },
      { id: 'm3', name: 'Valkyrie_Protocol', role: 'Officer', status: 'IN_MATCH', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Valkyrie', joinedAt: '2026-01-20' },
      { id: 'm4', name: 'Astro_Boy', role: 'Member', status: 'OFFLINE', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Astro', joinedAt: '2026-02-01' }
    ]
  },
  {
    id: 'clan_cyber_samurai',
    name: 'Cyber Samurai',
    tag: 'CS',
    description: 'Honor, precision, and lightning arcade reflexes in all arena battlefronts.',
    emblem: '⚡',
    level: 12,
    trophies: 2420,
    founderId: 'pilot_ronin',
    founderName: 'Cyber_Ronin',
    createdAt: '2026-01-15',
    members: [
      { id: 'm5', name: 'Cyber_Ronin', role: 'Leader', status: 'ONLINE', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ronin', joinedAt: '2026-01-15' },
      { id: 'm6', name: 'Shadow_Blade', role: 'Officer', status: 'ONLINE', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Blade', joinedAt: '2026-01-18' }
    ]
  },
  {
    id: 'clan_vanguard',
    name: 'Vanguard Prime',
    tag: 'VP',
    description: 'Strategic chess masters and puzzle tacticians dominating platform leaderboards.',
    emblem: '🛡️',
    level: 9,
    trophies: 1980,
    founderId: 'pilot_paladin',
    founderName: 'Aegis_Paladin',
    createdAt: '2026-02-05',
    members: [
      { id: 'm7', name: 'Aegis_Paladin', role: 'Leader', status: 'ONLINE', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Paladin', joinedAt: '2026-02-05' }
    ]
  }
];

interface ClanState {
  clans: Clan[];
  myClanId: string | null;
  clanMessages: Record<string, ClanChatMessage[]>;
  createClan: (data: { name: string; tag: string; description: string; emblem: string }, user: UserProfile) => { success: boolean; message: string };
  joinClan: (clanId: string, user: UserProfile) => { success: boolean; message: string };
  leaveClan: (clanId: string, userId: string) => void;
  disbandClan: (clanId: string) => void;
  sendClanMessage: (clanId: string, content: string, user: UserProfile) => void;
}

export const useClanStore = create<ClanState>()(
  persist(
    (set, get) => ({
      clans: DEFAULT_CLANS,
      myClanId: null, // User starts without a clan until they create or join one
      clanMessages: {
        clan_nexus: [
          { id: 'cm_1', sender: 'Neon_Specter', role: 'Officer', content: 'Weekly MOBA tournament brackets finalize tonight!', time: '10:30 AM' },
          { id: 'cm_2', sender: 'Valkyrie_Protocol', role: 'Officer', content: 'Ready to squad queue whenever you are.', time: '10:45 AM' }
        ]
      },

      createClan: ({ name, tag, description, emblem }, user) => {
        const cleanName = name.trim();
        const cleanTag = tag.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const cleanDesc = description.trim();

        // 1. Check Level Criteria
        if (user.level < CLAN_CREATION_CRITERIA.MIN_LEVEL) {
          return {
            success: false,
            message: `Level Requirement Not Met: Requires Level ${CLAN_CREATION_CRITERIA.MIN_LEVEL}+ to found a clan (Current: Level ${user.level}).`
          };
        }

        // 2. Check Rank ELO Criteria
        if (user.stats.rank < CLAN_CREATION_CRITERIA.MIN_RANK) {
          return {
            success: false,
            message: `Rank Requirement Not Met: Requires ${CLAN_CREATION_CRITERIA.MIN_RANK}+ ELO to lead a clan (Current: ${user.stats.rank} ELO).`
          };
        }

        // 3. Check Coin Cost Criteria
        if (user.coins < CLAN_CREATION_CRITERIA.COIN_COST) {
          return {
            success: false,
            message: `Treasury Fee Required: 150 Coins required to register clan charter (Current: ${user.coins} Coins).`
          };
        }

        // 4. Validate Name and Tag lengths
        if (cleanName.length < CLAN_CREATION_CRITERIA.MIN_NAME_LENGTH || cleanName.length > CLAN_CREATION_CRITERIA.MAX_NAME_LENGTH) {
          return {
            success: false,
            message: `Clan Name must be between ${CLAN_CREATION_CRITERIA.MIN_NAME_LENGTH} and ${CLAN_CREATION_CRITERIA.MAX_NAME_LENGTH} characters.`
          };
        }

        if (cleanTag.length < CLAN_CREATION_CRITERIA.MIN_TAG_LENGTH || cleanTag.length > CLAN_CREATION_CRITERIA.MAX_TAG_LENGTH) {
          return {
            success: false,
            message: `Clan Tag must be between ${CLAN_CREATION_CRITERIA.MIN_TAG_LENGTH} and ${CLAN_CREATION_CRITERIA.MAX_TAG_LENGTH} alphanumeric characters.`
          };
        }

        // 5. Check Tag Uniqueness
        const tagExists = get().clans.some(c => c.tag.toUpperCase() === cleanTag);
        if (tagExists) {
          return {
            success: false,
            message: `Clan Tag [${cleanTag}] is already registered by another guild.`
          };
        }

        // Deduct Coins
        const spent = useAuthStore.getState().spendCoins(CLAN_CREATION_CRITERIA.COIN_COST);
        if (!spent) {
          return { success: false, message: 'Failed to deduct clan registration fee.' };
        }

        const newClanId = `clan_${Date.now()}`;
        const newMember: ClanMember = {
          id: user.id,
          name: user.displayName || user.username,
          role: 'Leader',
          status: 'ONLINE',
          avatarUrl: user.avatarUrl,
          joinedAt: new Date().toISOString().split('T')[0]
        };

        const newClan: Clan = {
          id: newClanId,
          name: cleanName,
          tag: cleanTag,
          description: cleanDesc || 'Official Game World competitive alliance.',
          emblem: emblem || '👑',
          level: 1,
          trophies: user.stats.rank + 500,
          founderId: user.id,
          founderName: user.displayName || user.username,
          createdAt: new Date().toISOString().split('T')[0],
          members: [newMember],
          isCustomClan: true
        };

        const initialMsg: ClanChatMessage = {
          id: `cm_${Date.now()}`,
          sender: user.displayName || user.username,
          role: 'Leader',
          content: `Clan [${cleanTag}] ${cleanName} charter officially established! Welcome recruits.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        set({
          clans: [newClan, ...get().clans],
          myClanId: newClanId,
          clanMessages: {
            ...get().clanMessages,
            [newClanId]: [initialMsg]
          }
        });

        useSocialStore.getState().addNotification(
          'ACHIEVEMENT',
          `🎉 CLAN FOUNDED: You are now Commander of [${cleanTag}] ${cleanName}!`
        );

        return {
          success: true,
          message: `Clan [${cleanTag}] ${cleanName} registered successfully! 150 Coins invested.`
        };
      },

      joinClan: (clanId, user) => {
        const targetClan = get().clans.find(c => c.id === clanId);
        if (!targetClan) {
          return { success: false, message: 'Clan not found.' };
        }

        const isAlreadyMember = targetClan.members.some(m => m.id === user.id);
        if (isAlreadyMember) {
          set({ myClanId: clanId });
          return { success: true, message: `Switched to active clan [${targetClan.tag}] ${targetClan.name}.` };
        }

        const newMember: ClanMember = {
          id: user.id,
          name: user.displayName || user.username,
          role: 'Member',
          status: 'ONLINE',
          avatarUrl: user.avatarUrl,
          joinedAt: new Date().toISOString().split('T')[0]
        };

        const updatedClans = get().clans.map(c => {
          if (c.id === clanId) {
            return {
              ...c,
              members: [...c.members, newMember]
            };
          }
          return c;
        });

        set({
          clans: updatedClans,
          myClanId: clanId
        });

        useSocialStore.getState().addNotification(
          'ACHIEVEMENT',
          `Joined alliance [${targetClan.tag}] ${targetClan.name}!`
        );

        return {
          success: true,
          message: `Enlisted in [${targetClan.tag}] ${targetClan.name} successfully!`
        };
      },

      leaveClan: (clanId, userId) => {
        const clan = get().clans.find(c => c.id === clanId);
        if (!clan) return;

        const updatedClans = get().clans.map(c => {
          if (c.id === clanId) {
            return {
              ...c,
              members: c.members.filter(m => m.id !== userId)
            };
          }
          return c;
        });

        set({
          clans: updatedClans,
          myClanId: null
        });

        useSocialStore.getState().addNotification(
          'FRIEND_REQUEST',
          `You have departed from [${clan.tag}] ${clan.name}.`
        );
      },

      disbandClan: (clanId) => {
        const clan = get().clans.find(c => c.id === clanId);
        if (!clan) return;

        set({
          clans: get().clans.filter(c => c.id !== clanId),
          myClanId: null
        });

        useSocialStore.getState().addNotification(
          'ACHIEVEMENT',
          `Clan [${clan.tag}] ${clan.name} has been disbanded.`
        );
      },

      sendClanMessage: (clanId, content, user) => {
        const clean = content.trim();
        if (!clean) return;

        const currentMessages = get().clanMessages[clanId] || [];
        const newMsg: ClanChatMessage = {
          id: `cm_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          sender: user.displayName || user.username,
          role: get().clans.find(c => c.id === clanId)?.members.find(m => m.id === user.id)?.role || 'Member',
          content: clean,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        set({
          clanMessages: {
            ...get().clanMessages,
            [clanId]: [...currentMessages, newMsg]
          }
        });
      }
    }),
    {
      name: 'gw_clan_store_v2'
    }
  )
);
