// API Types matching ALL notice-reminders backend schemas

// ─── Users ──────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  name: string | null;
  telegram_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  name?: string;
  telegram_id?: string;
  notify_telegram?: boolean;
  notify_email?: boolean;
  notification_email?: string;
}

export interface UserUpdate {
  email?: string;
  name?: string;
  telegram_id?: string;
  is_active?: boolean;
}

// ─── Courses ────────────────────────────────────────────
export interface Course {
  id: number;
  code: string;
  title: string;
  url: string;
  instructor: string;
  institute: string;
  nc_code: string;
  created_at: string;
  updated_at: string;
}

// ─── Subscriptions ──────────────────────────────────────
export interface Subscription {
  id: number;
  user_id: number;
  course_id: number;
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionCreate {
  user_id: number;
  course_code: string;
}

// ─── Notification Channels ──────────────────────────────
export type ChannelType = "email" | "telegram";

export interface NotificationChannel {
  id: number;
  user_id: number;
  channel: ChannelType;
  address: string;
  is_active: boolean;
  created_at: string;
}

export interface NotificationChannelCreate {
  user_id: number;
  channel: ChannelType;
  address: string;
  is_active?: boolean;
}

// ─── Announcements ──────────────────────────────────────
export interface Announcement {
  id: number;
  course_id: number;
  title: string;
  date: string;
  content: string;
  fetched_at: string;
}

// ─── Notifications ──────────────────────────────────────
export interface Notification {
  id: number;
  user_id: number;
  subscription_id: number;
  announcement_id: number;
  channel_id: number | null;
  sent_at: string;
  is_read: boolean;
}
