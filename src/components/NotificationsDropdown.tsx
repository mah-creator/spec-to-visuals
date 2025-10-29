import { Bell, Loader2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/types/api';
import { useState, useEffect, useContext } from 'react';
import { formatTimestamp, getNotificationUrl } from '@/lib/utils';
import { AuthContext } from '@/App';

export const NotificationsDropdown = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const pageSize = 10;
  const { 
    notifications, 
    unreadCount, 
    markAsRead,
    markAllAsRead,
    hasMore, 
    isLoading 
  } = useNotifications(currentPage, pageSize);
  const { user } = useContext(AuthContext);
  
  const navigate = useNavigate();
  
  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Don't navigate for invitation notifications if user is not a customer
    if (notification.metadata?.resourceType === 'invitation' && user?.role !== 'customer') {
      setIsOpen(false);
      return;
    }
    
    const url = notification.metadata 
      ? getNotificationUrl(notification.metadata)
      : notification.actionUrl || '/';
    
    navigate(url);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    // Mark all unread notifications as read
    markAllAsRead();
  };

  // Reset to page 1 when dropdown opens
  useEffect(() => {
    if (isOpen && currentPage > 1) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start p-4 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <div className="flex-1">
                      <p className={`font-medium ${!notification.isRead ? 'text-primary' : 'text-foreground'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              {hasMore && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};