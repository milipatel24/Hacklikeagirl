
import React, { useState } from 'react';
import { Bell, Search, User, LogOut, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 shadow-lg rounded-2xl mx-2 mt-3 mb-6 sticky top-3 z-50 border border-zinc-200 dark:border-zinc-800 transition-all">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 
              className="text-3xl font-extrabold tracking-tight text-[#b07d62] cursor-pointer hover:text-[#8c624e] transition-colors duration-200"
              onClick={() => navigate('/')}
              style={{letterSpacing: '0.01em'}}>
              StackIt
            </h1>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-2 rounded-xl bg-white/80 dark:bg-zinc-800/80 shadow-inner border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-[#b07d62] transition-all"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user && (
              <Button
                onClick={() => navigate('/ask')}
                className="bg-[#b07d62] hover:bg-[#8c624e] text-white font-semibold rounded-xl shadow-md px-5 py-2 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ask Question
              </Button>
            )}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative rounded-full hover:bg-[#f3e3d7] dark:hover:bg-zinc-800 transition-all">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs p-0 flex items-center justify-center shadow"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between p-2">
                    <span className="font-semibold">Notifications</span>
                    <div className="flex gap-1">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="rounded-lg hover:bg-blue-100 dark:hover:bg-zinc-800"
                        >
                          Mark all read
                        </Button>
                      )}
                      {notifications.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAll}
                          className="text-red-600 hover:text-red-700 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`p-3 rounded-lg transition-all ${!notification.read ? 'bg-blue-50 dark:bg-zinc-800' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full ml-2" />
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                  {notifications.length > 5 && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="p-2 text-center">
                        <Button variant="ghost" size="sm" className="text-blue-600 rounded-lg">
                          View all notifications
                        </Button>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 rounded-full hover:bg-[#f3e3d7] dark:hover:bg-zinc-800 transition-all">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full shadow"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                    <span className="hidden sm:inline font-semibold text-base">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')} className="rounded-xl hover:bg-blue-50 dark:hover:bg-zinc-800 transition-all">
                  Login
                </Button>
                <Button onClick={() => navigate('/register')} className="rounded-xl bg-[#b07d62] hover:bg-[#8c624e] text-white font-semibold shadow-md px-5 py-2 transition-all duration-200">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
