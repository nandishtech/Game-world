import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface AddFriendResult {
  success: boolean;
  message: string;
}

interface SocialState {
  friends: Friend[];
  notifications: Notification[];
  chats: Record<string, ChatMessage[]>;
  unreadNotificationCount: () => number;
  addFriend: (username: string, currentUsername?: string) => AddFriendResult;
  removeFriend: (friendId: string) => void;
  updateFriendStatus: (friendId: string, status: Friend['status'], game?: string) => void;
  sendDirectMessage: (friendId: string, content: string, senderName?: string) => void;
  addNotification: (type: Notification['type'], content: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      friends: [],
      notifications: [],
      chats: {},

      unreadNotificationCount: () => {
        return get().notifications.filter(n => !n.isRead).length;
      },

      addFriend: (username: string, currentUsername?: string) => {
        const clean = username.trim();
        if (!clean) {
          return { success: false, message: 'Please enter a valid callsign / username.' };
        }

        // Cannot add oneself
        if (currentUsername && clean.toLowerCase() === currentUsername.trim().toLowerCase()) {
          return { success: false, message: 'You cannot add yourself to your squad roster.' };
        }

        // Cannot add duplicate friend
        const exists = get().friends.some(
          f => f.username.toLowerCase() === clean.toLowerCase()
        );
        if (exists) {
          return { success: false, message: `[${clean}] is already in your squad roster.` };
        }

        const newFriend: Friend = {
          id: `friend_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          username: clean,
          status: 'ONLINE',
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(clean)}`,
          rank: Math.floor(Math.random() * 400) + 800
        };

        set({
          friends: [...get().friends, newFriend]
        });

        get().addNotification('FRIEND_REQUEST', `Recruited ${clean} to your squad roster.`);

        return { success: true, message: `Successfully recruited ${clean} to your roster!` };
      },

      removeFriend: (friendId: string) => {
        const target = get().friends.find(f => f.id === friendId);
        if (!target) return;

        const updated = get().friends.filter(f => f.id !== friendId);
        set({ friends: updated });

        get().addNotification('FRIEND_REQUEST', `Removed ${target.username} from squad roster.`);
      },

      updateFriendStatus: (friendId, status, game) => {
        const updated = get().friends.map(f => 
          f.id === friendId ? { ...f, status, game } : f
        );
        set({ friends: updated });
      },

      sendDirectMessage: (friendId, content, senderName = 'Commander') => {
        const chatList = get().chats[friendId] || [];
        const newMsg: ChatMessage = {
          id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          sender: senderName,
          content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        set({
          chats: {
            ...get().chats,
            [friendId]: [...chatList, newMsg]
          }
        });

        // Quick intelligent auto-reply from friend after short delay
        const targetFriend = get().friends.find(f => f.id === friendId);
        if (targetFriend) {
          setTimeout(() => {
            const currentChats = get().chats[friendId] || [];
            const replies = [
              "Ready to queue for the next match!",
              "Nice strategy! Let's conquer the leaderboard.",
              "I'm in lobby. Join when you're ready.",
              "Good game! Let's run another round."
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            
            const replyMsg: ChatMessage = {
              id: 'msg_reply_' + Date.now(),
              sender: targetFriend.username,
              content: randomReply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            set({
              chats: {
                ...get().chats,
                [friendId]: [...currentChats, replyMsg]
              }
            });

            get().addNotification('MATCH_FOUND', `Message from ${targetFriend.username}: "${randomReply}"`);
          }, 2500);
        }
      },

      addNotification: (type, content) => {
        const newNotif: Notification = {
          id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          type,
          content,
          isRead: false,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        set({
          notifications: [newNotif, ...get().notifications.slice(0, 49)] // Keep latest 50
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
    }),
    {
      name: 'gw_social_store_v2'
    }
  )
);
