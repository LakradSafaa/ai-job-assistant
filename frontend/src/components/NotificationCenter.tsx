"use client";

import { Bell } from "lucide-react";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "match" | "interview" | "status";
  read: boolean;
};

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAllAsRead,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#005c45]/10 text-[#005c45]">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Centre de notifications
            </h2>
            <p className="text-xs text-slate-500">
              Mises à jour IA et alertes sur vos candidatures
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-[#005c45] hover:underline"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition ${
              notif.read
                ? "border-slate-100 bg-slate-50/50 opacity-80"
                : "border-emerald-100 bg-emerald-50/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#005c45]">
                  {notif.title}
                </span>
                <span className="text-[10px] text-slate-400">{notif.time}</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                {notif.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}