'use client';

import { motion } from 'framer-motion';
import UsersTable from '@/components/dashboard/UsersTable';
import { Users, UserCheck, Shield, Headphones } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function UsersPage() {
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    }
  });

  const totalStaff = users.filter((u: any) => u.role?.name !== 'Guest').length;
  const active = users.filter((u: any) => u.status === 'active').length;
  const managers = users.filter((u: any) => u.role?.name === 'Manager').length;
  const receptionists = users.filter((u: any) => u.role?.name === 'Receptionist').length;

  const userStats = [
    { label: 'Total Staff', value: totalStaff, icon: Users, color: '#C9A84C' },
    { label: 'Active Users', value: active, icon: UserCheck, color: '#34d399' },
    { label: 'Managers', value: managers, icon: Shield, color: '#a78bfa' },
    { label: 'Receptionists', value: receptionists, icon: Headphones, color: '#60a5fa' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>
          Users Management
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Manage staff accounts and permissions
        </p>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        {userStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{
                background: '#1A2235',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={stat.color} />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.73rem', margin: 0 }}>
                  {stat.label}
                </p>
                <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Users Table */}
      <UsersTable showAddButton={true} />
    </div>
  );
}
