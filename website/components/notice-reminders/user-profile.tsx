"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { updateUser, deleteUser, listUserChannels } from "@/lib/api";
import type { User, UserUpdate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Loader2,
  UserCircle,
  Save,
  Trash2,
  Mail,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<UserUpdate>({
    email: user.email,
    name: user.name ?? "",
    telegram_id: user.telegram_id ?? "",
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["channels", user.id],
    queryFn: () => listUserChannels(user.id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserUpdate) => updateUser(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(user.id),
    onSuccess: () => {
      onLogout();
    },
  });

  const handleSave = () => {
    const updates: UserUpdate = {};
    if (form.email !== user.email) updates.email = form.email;
    if (form.name !== (user.name ?? "")) updates.name = form.name;
    if (form.telegram_id !== (user.telegram_id ?? ""))
      updates.telegram_id = form.telegram_id;

    if (Object.keys(updates).length > 0) {
      updateMutation.mutate(updates);
    } else {
      setEditing(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-primary" />
          Profile
        </CardTitle>
        <CardDescription>
          Manage your account and notification channels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User info */}
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={form.email ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                type="text"
                value={form.name ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-telegram">Telegram ID</Label>
              <Input
                id="profile-telegram"
                type="text"
                value={form.telegram_id ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    telegram_id: e.target.value,
                  }))
                }
                placeholder="@username or chat ID"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                size="sm"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="ml-1.5">Save</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setForm({
                    email: user.email,
                    name: user.name ?? "",
                    telegram_id: user.telegram_id ?? "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
            {updateMutation.isError && (
              <p className="text-sm text-destructive">
                {updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : "Failed to update profile."}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.name
                    ? user.name[0].toUpperCase()
                    : user.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user.name || "No name set"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <Badge variant={user.is_active ? "default" : "secondary"}>
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            {user.telegram_id && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-3">
                <MessageCircle className="w-4 h-4" />
                Telegram: {user.telegram_id}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground px-3">
              <span className="text-xs">
                Member since{" "}
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="w-full"
            >
              Edit Profile
            </Button>
          </div>
        )}

        {/* Notification channels */}
        {channels.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Notification Channels
            </p>
            <div className="space-y-2">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      ch.is_active
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {ch.channel === "email" ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">
                      {ch.channel}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {ch.address}
                    </p>
                  </div>
                  <Badge
                    variant={ch.is_active ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {ch.is_active ? "On" : "Off"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="pt-4 border-t border-border/50">
          {confirmDelete ? (
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-sm font-medium">
                  Are you sure? This cannot be undone.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                All your subscriptions and notification settings will be
                permanently removed.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span className="ml-1.5">Delete Account</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="ml-1.5">Delete Account</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
