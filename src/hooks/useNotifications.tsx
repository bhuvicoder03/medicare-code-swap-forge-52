
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock type for notifications without Supabase
type Notification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  user_id: string;
};

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Mock fetching notifications
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Welcome',
            message: 'Welcome to RI Medicare',
            created_at: new Date().toISOString(),
            read: false,
            user_id: userId
          },
          {
            id: '2',
            title: 'Health Card',
            message: 'Your health card application is approved',
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            read: true,
            user_id: userId
          }
        ];
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } catch (e) {
        console.error('Exception fetching notifications:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Mock real-time functionality with a timer
    const notificationTimer = setInterval(() => {
      const randomChance = Math.random();
      // 10% chance of receiving a new notification every 30 seconds
      if (randomChance < 0.1) {
        const newNotification: Notification = {
          id: `new-${Date.now()}`,
          title: 'New Update',
          message: 'You have a new system update',
          created_at: new Date().toISOString(),
          read: false,
          user_id: userId
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show a toast for the new notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(notificationTimer);
    };
  }, [userId, toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state
      setNotifications(
        notifications.map(notification => 
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (e) {
      console.error('Exception marking notification as read:', e);
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!userId || notifications.filter(n => !n.read).length === 0) return true;

    try {
      // Update local state
      setNotifications(
        notifications.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      return true;
    } catch (e) {
      console.error('Exception marking all notifications as read:', e);
      return false;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
};
