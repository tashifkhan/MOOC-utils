// API client for notice-reminders backend
import type {
  User,
  UserUpdate,
  Course,
  Subscription,
  SubscriptionCreate,
  NotificationChannel,
  NotificationChannelCreate,
  Announcement,
  Notification,
  OtpRequestResponse,
  AuthStatus,
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
    credentials: "include",
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

export async function getUser(userId: number): Promise<User> {
  return request<User>(`/users/${userId}`);
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

export async function listSubscriptions(): Promise<Subscription[]> {
  return request<Subscription[]>(`/subscriptions`);
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


export async function markNotificationRead(
  notificationId: number
): Promise<Notification> {
  return request<Notification>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

// Auth
export async function requestOtp(email: string): Promise<OtpRequestResponse> {
  return request<OtpRequestResponse>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(
  email: string,
  code: string
): Promise<AuthStatus> {
  return request<AuthStatus>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function refreshSession(): Promise<AuthStatus> {
  return request<AuthStatus>("/auth/refresh", {
    method: "POST",
  });
}

export async function logout(): Promise<void> {
  return request<void>("/auth/logout", {
    method: "POST",
  });
}

export async function getMe(): Promise<User> {
  return request<User>("/auth/me");
}

export { APIError };
