// API client for notice-reminders backend
import type {
  User,
  UserCreate,
  UserUpdate,
  Course,
  Subscription,
  SubscriptionCreate,
  NotificationChannel,
  NotificationChannelCreate,
  Announcement,
  Notification,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class APIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new APIError(res.status, error.detail || "Request failed");
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// Users
export async function createUser(data: UserCreate): Promise<User> {
  return request<User>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getUser(userId: number): Promise<User> {
  return request<User>(`/users/${userId}`);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    return await request<User>(`/users/by-email?email=${encodeURIComponent(email)}`);
  } catch (e) {
    if (e instanceof APIError && e.status === 404) {
      return null;
    }
    throw e;
  }
}

export async function updateUser(
  userId: number,
  data: UserUpdate
): Promise<User> {
  return request<User>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(userId: number): Promise<void> {
  return request<void>(`/users/${userId}`, {
    method: "DELETE",
  });
}

// Courses
export async function listCourses(): Promise<Course[]> {
  return request<Course[]>("/courses");
}

export async function getCourse(courseCode: string): Promise<Course> {
  return request<Course>(`/courses/${encodeURIComponent(courseCode)}`);
}

// Announcements
export async function listAnnouncements(
  courseCode: string
): Promise<Announcement[]> {
  return request<Announcement[]>(
    `/courses/${encodeURIComponent(courseCode)}/announcements`
  );
}

// Search
export async function searchCourses(query: string): Promise<Course[]> {
  return request<Course[]>(`/search?q=${encodeURIComponent(query)}`);
}

// Subscriptions
export async function createSubscription(
  data: SubscriptionCreate
): Promise<Subscription> {
  return request<Subscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listSubscriptions(userId?: number): Promise<Subscription[]> {
  const query = userId ? `?user_id=${userId}` : "";
  return request<Subscription[]>(`/subscriptions${query}`);
}

export async function deleteSubscription(subscriptionId: number): Promise<void> {
  return request<void>(`/subscriptions/${subscriptionId}`, {
    method: "DELETE",
  });
}

// Notification Channels
export async function addNotificationChannel(
  userId: number,
  data: NotificationChannelCreate
): Promise<NotificationChannel> {
  return request<NotificationChannel>(`/users/${userId}/channels`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listUserChannels(
  userId: number
): Promise<NotificationChannel[]> {
  return request<NotificationChannel[]>(`/users/${userId}/channels`);
}

// Notifications
export async function listNotifications(): Promise<Notification[]> {
  return request<Notification[]>("/notifications");
}

export async function listUserNotifications(
  userId: number
): Promise<Notification[]> {
  return request<Notification[]>(`/notifications/users/${userId}`);
}

export async function markNotificationRead(
  notificationId: number
): Promise<Notification> {
  return request<Notification>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

// Convenience: full signup flow
export async function completeSignup(params: {
  email: string;
  name?: string;
  notifyEmail: boolean;
  notifyTelegram: boolean;
  telegramId?: string;
  courseCodes: string[];
}): Promise<{
  user: User;
  subscriptions: Subscription[];
}> {
  // 1. Create or get user
  let user: User;
  const existing = await getUserByEmail(params.email);
  
  if (existing) {
    user = existing;
  } else {
    user = await createUser({
      email: params.email,
      name: params.name,
      notify_email: params.notifyEmail,
      notify_telegram: params.notifyTelegram,
      telegram_id: params.telegramId,
      notification_email: params.notifyEmail ? params.email : undefined,
    });
  }

  // 2. Create subscriptions
  const subscriptions: Subscription[] = [];
  for (const courseCode of params.courseCodes) {
    try {
      const sub = await createSubscription({
        user_id: user.id,
        course_code: courseCode,
      });
      subscriptions.push(sub);
    } catch (e) {
      // May already be subscribed, continue
      console.warn(`Failed to subscribe to ${courseCode}:`, e);
    }
  }

  return { user, subscriptions };
}

export { APIError };
