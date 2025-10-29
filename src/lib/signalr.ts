// signalr.ts
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from './api-client';
import { Notification, Comment } from '@/types/api';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private notificationHandlers: ((notification: Notification) => void)[] = [];
  private commentHandlers: ((comment: Comment) => void)[] = [];

  async connect(token: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveNotification', (notification: Notification) => {
      console.log('Received notification:', notification);
      this.notificationHandlers.forEach(handler => handler(notification));
    });

    // Add comment handler
    this.connection.on('ReceiveComment', (comment: Comment) => {
      console.log('Received comment:', comment);
      this.commentHandlers.forEach(handler => handler(comment));
    });

    try {
      await this.connection.start();
      console.log('SignalR connected');
    } catch (error) {
      console.error('SignalR connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  onNotification(handler: (notification: Notification) => void) {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter(h => h !== handler);
    };
  }

  onComment(handler: (comment: Comment) => void) {
    this.commentHandlers.push(handler);
    return () => {
      this.commentHandlers = this.commentHandlers.filter(h => h !== handler);
    };
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();