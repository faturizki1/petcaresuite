import { Bell, Menu, Moon, Sun, LogOut, Search, UserCircle, ChevronRight, Inbox } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/ui.store';
import { useAuthActions } from '@/features/auth/auth.hooks';

interface NavbarProps {
  onOpenCommand: () => void;
  onToggleSidebar: () => void;
  unreadCount: number;
}

const notifications = [
  { id: '1', title: 'Appointment confirmed', description: 'Your appointment with Dr. Lina is confirmed.', time: '2m ago' },
  { id: '2', title: 'New pet added', description: 'A new pet record was created for Mr. Supo.', time: '1h ago' },
  { id: '3', title: 'Inventory update', description: 'Stock for vaccine kits has been updated.', time: '5h ago' }
];

export function Navbar({ onOpenCommand, onToggleSidebar, unreadCount }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { signOut } = useAuthActions();
  const setTheme = useUIStore((state) => state.setTheme);
  const activeTheme = useUIStore((state) => state.activeTheme);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onToggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onOpenCommand}>
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTheme(activeTheme === 'light' ? 'dark' : 'light')}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {activeTheme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((open) => !open)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute right-1 top-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 top-14 z-20 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950">
              <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-800">Notifications</div>
              <div className="max-h-72 space-y-2 overflow-y-auto p-3">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className="w-full rounded-3xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900"
                    onClick={() => {
                      setIsNotificationsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <Inbox className="h-4 w-4" />
                      {notification.title}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{notification.description}</p>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">{notification.time}</div>
                  </button>
                ))}
                {!notifications.length && <div className="p-3 text-sm text-slate-500 dark:text-slate-400">No notifications</div>}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-900 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <UserCircle className="h-5 w-5" />
            <span>{user?.fullName ?? 'User'}</span>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <UserCircle className="h-4 w-4" />
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  signOut();
                }}
                className="mt-2 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {(isProfileOpen || isNotificationsOpen) && <div className="fixed inset-0 z-10 lg:hidden" onClick={() => { setIsProfileOpen(false); setIsNotificationsOpen(false); }} />}
    </div>
  );
}
