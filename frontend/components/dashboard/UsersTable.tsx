"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import StatusBadge from "@/components/shared/StatusBadge";
import { Search, UserPlus, Edit2, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const roleColors: Record<string, { bg: string; color: string }> = {
  Manager: { bg: 'rgba(139,92,246,0.18)', color: '#a78bfa' },
  Receptionist: { bg: 'rgba(59,130,246,0.18)', color: '#60a5fa' },
  Admin: { bg: 'rgba(20,184,166,0.18)', color: '#2dd4bf' },
  Guest: { bg: 'rgba(148,163,184,0.14)', color: '#94a3b8' },
};

function getInitials(name: string) {
  if (!name) return "US";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UsersTableProps {
  showAddButton?: boolean;
}

export default function UsersTable({ showAddButton = true }: UsersTableProps) {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = users.filter((u: any) => {
      const name = `${u.first_name} ${u.last_name}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      const roleName = (u.role?.name || "Guest").toLowerCase();
      return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase()) || roleName.includes(search.toLowerCase());
  });

  return (
    <div
      style={{
        background: '#1A2235',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
          Users Management
        </h3>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              color="rgba(255,255,255,0.35)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.85rem',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                outline: 'none',
                width: '200px',
              }}
            />
          </div>

          {/* Add User Button */}
          {showAddButton && (
            <button
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #a8863c)',
                color: '#0A0F1E',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <UserPlus size={15} />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['Avatar', 'Name', 'Email', 'Role', 'Status', 'Actions'].map(
                (col) => (
                  <th
                    key={col}
                    style={{
                      color: 'rgba(255,255,255,0.45)',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C9A84C]" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2.5rem', fontSize: '0.9rem' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((user: any) => {
                const roleName = user.role?.name || 'Guest';
                const roleStyle = roleColors[roleName] || roleColors.Guest;
                const fullName = `${user.first_name} ${user.last_name}`;
                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'rgba(201,168,76,0.04)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #C9A84C, #8b6914)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#0A0F1E', fontWeight: 700, fontSize: '0.75rem',
                        }}
                      >
                        {getInitials(fullName)}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#ffffff', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                      {fullName}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          background: roleStyle.bg, color: roleStyle.color,
                          borderRadius: '6px', padding: '0.25rem 0.65rem',
                          fontSize: '0.75rem', fontWeight: 600,
                        }}
                      >
                        {roleName}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge status={user.status} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(user.id)}
                          style={{
                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px', width: '30px', height: '30px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} color="#f87171" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
