// The OpenAPI document defines notification endpoints but omits response schemas.
// These fields describe the response already consumed by the notification UI.
export interface NotificationItem {
  id: number;
  body: string;
  created_at: string;
  seen: boolean;
}

export interface NotificationsResponse {
  status: number;
  data: {
    notifications: NotificationItem[];
    pagination: { total: number };
  };
}

export interface MarkNotificationSeenResponse {
  status: number;
}
