'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/store';
import { authService } from '@/lib/api';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { 
  Menu, 
  Building2, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  HelpCircle
} from 'lucide-react';

export function Header() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore
    } finally {
      logout();
      router.push('/login');
    }
  };

  const getUserInitials = () => {
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const formatUserType = (userType: string) => {
    return userType.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="header-menu-btn" 
          onClick={toggleMobileSidebar}
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
        
        {user?.facility && (
          <div className="header-badge">
            <Building2 size={14} strokeWidth={2} />
            <span>{user.facility.name}</span>
          </div>
        )}
      </div>

      <div className="header-right">
        <NotificationDropdown />

        <div className="user-dropdown" ref={dropdownRef}>
          <button 
            className="user-menu"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <div className="user-avatar">
              {getUserInitials()}
            </div>
            <div className="user-info hide-mobile">
              <div className="user-name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="user-role">
                {user?.userType && formatUserType(user.userType)}
              </div>
            </div>
            <ChevronDown 
              size={14} 
              className="hide-mobile" 
              style={{ 
                color: 'var(--muted)',
                transition: 'transform 0.2s ease',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </button>

          <div className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
            <div style={{ 
              padding: 'var(--space-3) var(--space-4)', 
              borderBottom: '1px solid var(--border)',
              marginBottom: 'var(--space-2)'
            }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                {user?.email || user?.phone}
              </div>
            </div>

            <Link 
              href="/profile" 
              className="dropdown-item"
              onClick={() => setDropdownOpen(false)}
            >
              <User size={16} strokeWidth={1.75} />
              Profile
            </Link>
            <Link 
              href="/settings" 
              className="dropdown-item"
              onClick={() => setDropdownOpen(false)}
            >
              <Settings size={16} strokeWidth={1.75} />
              Settings
            </Link>
            <Link 
              href="/help" 
              className="dropdown-item"
              onClick={() => setDropdownOpen(false)}
            >
              <HelpCircle size={16} strokeWidth={1.75} />
              Help & Support
            </Link>
            <div className="dropdown-divider" />
            <button 
              className="dropdown-item" 
              onClick={handleLogout}
              style={{ color: 'var(--error)' }}
            >
              <LogOut size={16} strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
