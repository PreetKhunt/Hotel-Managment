'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, User, Settings, LogOut, CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import TopLeftBackButton from '@/components/shared/TopLeftBackButton';
import { useSystemNotifications } from '@/hooks/useOperationalModules';

const pageTitles: Record<string, { title: string; breadcrumb: string[] }> = {
  '/dashboard': { title: 'Overview', breadcrumb: ['Dashboard', 'Overview'] },
  '/dashboard/rooms': { title: 'Room Management', breadcrumb: ['Dashboard', 'Rooms'] },
  '/dashboard/bookings': { title: 'Bookings', breadcrumb: ['Dashboard', 'Bookings'] },
  '/dashboard/housekeeping': { title: 'Housekeeping Management', breadcrumb: ['Dashboard', 'Housekeeping'] },
  '/dashboard/maintenance': { title: 'Maintenance Operations', breadcrumb: ['Dashboard', 'Maintenance'] },
  '/dashboard/revenue': { title: 'Revenue', breadcrumb: ['Dashboard', 'Revenue'] },
  '/dashboard/users': { title: 'Users', breadcrumb: ['Dashboard', 'Users'] },
  '/dashboard/settings': { title: 'Settings', breadcrumb: ['Dashboard', 'Settings'] },
};

const mockNotifications = [
  { id: '1', text: 'New booking BK-2401 confirmed for James Morrison', time: '5 mins ago', type: 'success', icon: CheckCircle, color: '#10B981', link: '/dashboard/bookings' },
  { id: '2', text: 'Booking BK-2402 is pending confirmation from Sophia Chen', time: '1 hour ago', type: 'pending', icon: Clock, color: '#fbbf24', link: '/dashboard/bookings' },
  { id: '3', text: 'Room Deluxe Ocean View 002 set to maintenance state', time: '2 hours ago', type: 'alert', icon: AlertTriangle, color: '#EF4444', link: '/dashboard/maintenance' }
];

export default function DashboardTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const pageInfo = pageTitles[pathname] || { title: 'Dashboard', breadcrumb: ['Dashboard'] };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [localUnread, setLocalUnread] = useState(true);
  
  const { notifications: liveNotifs, unreadCount: apiUnread, markAllRead, markRead } = useSystemNotifications();
  const hasUnread = (apiUnread > 0) || (localUnread && liveNotifs.length === 0);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <header
      style={{
        position: 'relative', // Changed to relative for dropdown boundaries or absolute layout overlays
        height: '64px',
        background: '#0A0F1E',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 50,
      }}
    >
      {/* Left: Title + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <TopLeftBackButton />
        <div>
          <h1
            style={{
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1.05rem',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {pageInfo.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
            {pageInfo.breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {i > 0 && (
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>/</span>
                )}
                <span
                  style={{
                    color: i === pageInfo.breadcrumb.length - 1
                      ? '#C9A84C'
                      : 'rgba(255,255,255,0.35)',
                    fontSize: '0.73rem',
                    fontWeight: i === pageInfo.breadcrumb.length - 1 ? 600 : 400,
                  }}
                >
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Search + Bell + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={14}
            color="rgba(255,255,255,0.3)"
            style={{ position: 'absolute', left: '0.65rem' }}
          />
          <input
            type="text"
            placeholder="Search..."
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.82rem',
              padding: '0.42rem 0.75rem 0.42rem 2rem',
              outline: 'none',
              width: '180px',
            }}
          />
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notificationsRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
              setLocalUnread(false);
            }}
            style={{
              position: 'relative',
              background: showNotifications ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!showNotifications) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,168,76,0.12)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showNotifications) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
              }
            }}
          >
            <Bell size={17} color={showNotifications ? '#C9A84C' : 'rgba(255,255,255,0.7)'} />
            {/* Red Dot Badge */}
            {hasUnread && (
              <span
                style={{
                  position: 'absolute',
                  top: '7px',
                  right: '7px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#f87171',
                  border: '1.5px solid #0A0F1E',
                }}
              />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: '0',
                width: '340px',
                background: '#1A2235',
                border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5), 0 0 20px rgba(201,168,76,0.05)',
                padding: '0.85rem',
                zIndex: 100,
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.85rem' }}>Notifications</span>
                <span style={{ color: '#C9A84C', fontSize: '0.72rem', cursor: 'pointer' }} onClick={() => { setLocalUnread(false); if (liveNotifs.length > 0) markAllRead(); }}>Mark all as read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.65rem' }}>
                {liveNotifs.map((n) => {
                  const color = n.priority === 'Critical' ? '#EF4444' : n.priority === 'Warning' ? '#fbbf24' : '#3b82f6';
                  const Icon = n.priority === 'Critical' ? AlertTriangle : n.priority === 'Warning' ? Clock : Info;
                  return (
                    <div key={n.id} style={{ display: 'flex', gap: '0.65rem', padding: '0.5rem', borderRadius: '6px', background: n.is_read ? 'transparent' : 'rgba(201,168,76,0.08)', transition: 'background 0.2s', cursor: 'pointer' }}
                         onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                         onMouseLeave={(e) => (e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(201,168,76,0.08)')}
                         onClick={() => {
                           if (!n.is_read) markRead(n.id);
                           if (n.link) { setShowNotifications(false); router.push(n.link); }
                         }}>
                      <div style={{ background: `${color}15`, borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={14} color={color} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ color: '#C9A84C', fontSize: '0.75rem', fontWeight: 600, lineHeight: '1.2' }}>{n.title}</span>
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.73rem', lineHeight: '1.25', marginTop: '2px' }}>{n.message}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginTop: '3px' }}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
                {mockNotifications.map((notif) => {
                  const IconComponent = notif.icon;
                  return (
                    <div key={notif.id} style={{ display: 'flex', gap: '0.65rem', padding: '0.45rem', borderRadius: '6px', transition: 'background 0.2s', cursor: 'pointer' }}
                         onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                         onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                         onClick={() => { if (notif.link) { setShowNotifications(false); router.push(notif.link); } }}>
                      <div style={{ background: `${notif.color}15`, borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyItems: 'center', flexShrink: 0, justifyContent: 'center' }}>
                        <IconComponent size={14} color={notif.color} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.73rem', lineHeight: '1.25' }}>{notif.text}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginTop: '3px' }}>{notif.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #C9A84C, #8b6914)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A0F1E',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              flexShrink: 0,
              border: showProfile ? '2px solid #C9A84C' : '2px solid rgba(201,168,76,0.4)',
              transition: 'border 0.2s',
            }}
          >
            AR
          </div>

          {/* User Profile Dropdown */}
          {showProfile && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: '0',
                width: '180px',
                background: '#1A2235',
                border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5), 0 0 20px rgba(201,168,76,0.05)',
                padding: '0.5rem 0',
                zIndex: 100,
              }}
            >
              <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8rem', margin: 0 }}>Alexandra Reed</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', margin: '2px 0 0 0' }}>manager</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.25rem' }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.75)',
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.78rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(201,168,76,0.1)';
                    e.currentTarget.style.color = '#C9A84C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                  }}
                >
                  <User size={13} />
                  My Profile
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.75)',
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.78rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(201,168,76,0.1)';
                    e.currentTarget.style.color = '#C9A84C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                  }}
                >
                  <Settings size={13} />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#f87171',
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.78rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.2s',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    marginTop: '0.25rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={13} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
