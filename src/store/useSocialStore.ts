import { create } from 'zustand';

export interface Friend {
  id: string;
  username: string;
  status: 'ONLINE' | 'IN_MATCH' | 'AWAY' | 'OFFLINE';
  game?: string;
  avatarUrl: string;
  rank: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'FRIEND_REQUEST' | 'MATCH_FOUND' | 'ACHIEVEMENT';
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface SocialState {
  friends: Friend[];
  notifications: Notification[];
  chats: Record<string, ChatMessage[]>;
  unreadNotificationCount: () => number;
  addFriend: (username: string) => void;
  updateFriendStatus: (friendId: string, status: Friend['status'], game?: string) => void;
  sendDirectMessage: (friendId: string, content: string) => void;
  addNotification: (type: Notification['type'], content: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'friend_01',
    username: 'Neon_Specter',
    status: 'ONLINE',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    rank: 1720
  },
  {
    id: 'friend_02',
    username: 'Valkyrie_Protocol',
    status: 'IN_MATCH',
    game: 'Battle Arena',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    rank: 1980
  },
  {
    id: 'friend_03',
    username: 'Ghost_Rider_4',
    status: 'AWAY',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    rank: 1540
  },
  {
    id: 'friend_04',
    username: 'Astro_Boy',
    status: 'OFFLINE',
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
    rank: 1610
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_01',
    type: 'FRIEND_REQUEST',
    content: 'Shadow_Ninja sent you a friend request.',
    isRead: false,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: 'notif_02',
    type: 'ACHIEVEMENT',
    content: 'Unlocked Achievement: "Hexa-Kill Specialist" (+25 XP).',
    isRead: false,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

const INITIAL_CHATS: Record<string, ChatMessage[]> = {
  friend_01: [
    { id: 'msg_01', sender: 'Neon_Specter', content: 'Yo, down to play some Chess Masters?', timestamp: '11:32 PM' },
    { id: 'msg_02', sender: 'Commander_Nexus', content: 'Yeah, let me finish this build first.', timestamp: '11:33 PM' }
  ]
};

export const useSocialStore = create<SocialState>((set, get) => ({
  friends: INITIAL_FRIENDS,
  notifications: INITIAL_NOTIFICATIONS,
  chats: INITIAL_CHATS,

  unreadNotificationCount: () => {
    return get().notifications.filter(n => !n.isRead).length;
  },

  addFriend: (username) => {
    const newFriend: Friend = {
      id: 'friend_' + Math.floor(Math.random() * 10000),
      username,
      status: 'ONLINE',
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150`,
      rank: 1200
    };
    set({
      friends: [...get().friends, newFriend]
    });
    get().addNotification('FRIEND_REQUEST', `You are now friends with ${username}.`);
  },

  updateFriendStatus: (friendId, status, game) => {
    const updated = get().friends.map(f => 
      f.id === friendId ? { ...f, status, game } : f
    );
    set({ friends: updated });
  },

  sendDirectMessage: (friendId, content) => {
    const chatList = get().chats[friendId] || [];
    const newMsg: ChatMessage = {
      id: 'msg_' + Math.floor(Math.random() * 100000),
      sender: 'Commander_Nexus',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    set({
      chats: {
        ...get().chats,
        [friendId]: [...chatList, newMsg]
      }
    });

    // Mock quick automatic reply
    setTimeout(() => {
      const currentChats = get().chats[friendId] || [];
      const replyMsg: ChatMessage = {
        id: 'msg_reply_' + Math.floor(Math.random() * 100000),
        sender: get().friends.find(f => f.id === friendId)?.username || 'Friend',
        content: `Got it! Let's queue up soon.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      set({
        chats: {
          ...get().chats,
          [friendId]: [...currentChats, replyMsg]
        }
      });
      get().addNotification('MATCH_FOUND', `Message from ${replyMsg.sender}`);
    }, 3000);
  },

  addNotification: (type, content) => {
    const newNotif: Notification = {
      id: 'notif_' + Math.floor(Math.random() * 100000),
      type,
      content,
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    set({
      notifications: [newNotif, ...get().notifications]
    });
  },

  markNotificationAsRead: (notificationId) => {
    const updated = get().notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    set({ notifications: updated });
  },

  clearNotifications: () => {
    set({ notifications: [] });
  }
}));
