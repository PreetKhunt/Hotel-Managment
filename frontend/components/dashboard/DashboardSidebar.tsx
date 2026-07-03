'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  DollarSign,
  Users,
  Settings,
  Crown,
  LogOut,
  UtensilsCrossed,
  Sparkles,
  Dumbbell,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: BedDouble, label: 'Rooms', href: '/dashboard/rooms' },
  { icon: CalendarDays, label: 'Bookings', href: '/dashboard/bookings' },
  { icon: UtensilsCrossed, label: 'Dining', href: '/dashboard/dining' },
  { icon: Sparkles, label: 'Spa', href: '/dashboard/spa' },
  { icon: Dumbbell, label: 'Fitness', href: '/dashboard/fitness' },
  { icon: DollarSign, label: 'Revenue', href: '/dashboard/revenue' },
  { icon: Users, label: 'Users', href: '/dashboard/users' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const guestNavItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: CalendarDays, label: 'My Bookings', href: '/dashboard/bookings' },
  { icon: UtensilsCrossed, label: 'My Dining', href: '/dashboard/dining' },
  { icon: Sparkles, label: 'My Spa', href: '/dashboard/spa' },
  { icon: Dumbbell, label: 'My Fitness', href: '/dashboard/fitness' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const navItems = user?.role?.name === 'Admin' ? adminNavItems : guestNavItems;

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '256px',
        background: '#060B16',
        borderRight: '1px solid rgba(201,168,76,0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #C9A84C, #8b6914)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Crown size={20} color="#0A0F1E" />
        </div>
        <div>
          <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', margin: 0, lineHeight: 1.2 }}>
            Hospitality
          </p>
          <p style={{ color: '#C9A84C', fontWeight: 600, fontSize: '0.75rem', margin: 0, letterSpacing: '0.05em' }}>
            Hub
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p
          style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.68rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            padding: '0 0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          Main Menu
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                textDecoration: 'none',
                background: isActive ? '#C9A84C' : 'transparent',
                color: isActive ? '#0A0F1E' : 'rgba(148,163,184,0.9)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    'rgba(201,168,76,0.12)';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(148,163,184,0.9)';
                }
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.65rem 0.75rem',
            borderRadius: '8px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(248,113,113,0.8)',
            fontWeight: 500,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.1)';
            (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,113,113,0.8)';
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
