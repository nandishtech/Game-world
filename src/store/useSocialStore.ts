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

const INITIAL_FRIENDS: Friend[] = [];

const INITIAL_NOTIFICATIONS: Notification[] = [];

const INITIAL_CHATS: Record<string, ChatMessage[]> = {};

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
