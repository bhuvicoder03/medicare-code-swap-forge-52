
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/app.types';
import { useToast } from '@/hooks/use-toast';

type Notification = Tables['notifications']['Row'];

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

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
        } else {
          setNotifications(data || []);
          setUnreadCount((data || []).filter(n => !n.read).length);
        }
      } catch (e) {
        console.error('Exception fetching notifications:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up a real-time subscription for new notifications
    let subscription;
    
    try {
      subscription = supabase
        .channel(`notifications_for_${userId}`) // Add unique channel name
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show a toast for the new notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        )
        .subscribe((status, err) => {
          // Log subscription status
          if (err) {
            console.error('Supabase real-time subscription error:', err);
          } else {
            console.log('Supabase real-time subscription status:', status);
          }
        });
    } catch (e) {
      console.error('Exception setting up real-time subscription:', e);
    }

    return () => {
      if (subscription) {
        try {
          supabase.removeChannel(subscription);
        } catch (e) {
          console.error('Error unsubscribing from channel:', e);
        }
      }
    };
  }, [userId, toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

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
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

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
