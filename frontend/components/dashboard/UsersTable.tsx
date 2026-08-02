"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import StatusBadge from "@/components/shared/StatusBadge";
import { Search, UserPlus, Edit2, Trash2, Loader2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import UserFormModal from "./UserFormModal";

const roleColors: Record<string, { bg: string; color: string }> = {
  Manager: { bg: 'rgba(139,92,246,0.18)', color: '#a78bfa' },
  Receptionist: { bg: 'rgba(59,130,246,0.18)', color: '#60a5fa' },
  Admin: { bg: 'rgba(20,184,166,0.18)', color: '#2dd4bf' },
  Staff: { bg: 'rgba(245,158,11,0.18)', color: '#f59e0b' },
  Guest: { bg: 'rgba(148,163,184,0.14)', color: '#94a3b8' },
};

function getInitials(name: string) {
  if (!name || name.trim() === '') return "US";
  return name
    .trim()
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
  const [sortField, setSortField] = useState<'name' | 'email' | 'role' | 'status'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

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

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleSort = (field: 'name' | 'email' | 'role' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  const filtered = users.filter((u: any) => {
    const firstName = u.first_name || u.firstName || "";
    const lastName = u.last_name || u.lastName || "";
    const name = `${firstName} ${lastName}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const roleName = (u.role?.name || "Guest").toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || email.includes(query) || roleName.includes(query);
  });

  const sorted = [...filtered].sort((a: any, b: any) => {
    let valA = "";
    let valB = "";

    if (sortField === 'name') {
      valA = `${a.first_name || a.firstName || ''} ${a.last_name || a.lastName || ''}`.toLowerCase();
      valB = `${b.first_name || b.firstName || ''} ${b.last_name || b.lastName || ''}`.toLowerCase();
    } else if (sortField === 'email') {
      valA = (a.email || '').toLowerCase();
      valB = (b.email || '').toLowerCase();
    } else if (sortField === 'role') {
      valA = (a.role?.name || 'Guest').toLowerCase();
      valB = (b.role?.name || 'Guest').toLowerCase();
    } else if (sortField === 'status') {
      valA = (a.status || '').toLowerCase();
      valB = (b.status || '').toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderSortIcon = (field: 'name' | 'email' | 'role' | 'status') => {
    if (sortField !== field) return null;
    return sortAsc ? <ChevronUp size={14} style={{ display: 'inline', marginLeft: '3px' }} /> : <ChevronDown size={14} style={{ display: 'inline', marginLeft: '3px' }} />;
  };

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
          Staff & User Accounts
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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search users..."
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.85rem',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                outline: 'none',
                width: '220px',
              }}
            />
          </div>

          {/* Add User Button */}
          {showAddButton && (
            <button
              onClick={handleAddUser}
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #a8863c)',
                color: '#0A0F1E',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(201,168,76,0.25)',
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
              <th style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0.75rem 1rem', textAlign: 'left', width: '60px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                Avatar
              </th>
              <th
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)', userSelect: 'none' }}
              >
                Name {renderSortIcon('name')}
              </th>
              <th
                onClick={() => handleSort('email')}
                style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)', userSelect: 'none' }}
              >
                Email {renderSortIcon('email')}
              </th>
              <th
                onClick={() => handleSort('role')}
                style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)', userSelect: 'none' }}
              >
                Role {renderSortIcon('role')}
              </th>
              <th
                onClick={() => handleSort('status')}
                style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)', userSelect: 'none' }}
              >
                Status {renderSortIcon('status')}
              </th>
              <th style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C9A84C]" />
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2.5rem', fontSize: '0.9rem' }}>
                  No users matching criteria.
                </td>
              </tr>
            ) : (
              paginated.map((user: any) => {
                const roleName = user.role?.name || 'Guest';
                const roleStyle = roleColors[roleName] || roleColors.Guest;
                const firstName = user.first_name || user.firstName || '';
                const lastName = user.last_name || user.lastName || '';
                const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed User';

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
                      <div style={{ fontWeight: 600 }}>{fullName}</div>
                      {user.phone && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>{user.phone}</div>}
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
                      <StatusBadge status={user.status || 'active'} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          title="Edit User"
                          onClick={() => handleEdit(user)}
                          style={{
                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)')}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)')}
                        >
                          <Edit2 size={14} color="rgba(255,255,255,0.7)" />
                        </button>
                        <button
                          title="Delete User"
                          onClick={() => handleDelete(user.id)}
                          style={{
                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.2)')}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)')}
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

      {/* Pagination Footer */}
      {!isLoading && sorted.length > 0 && (
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.015)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' }}>
            Showing <strong style={{ color: '#ffffff' }}>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong style={{ color: '#ffffff' }}>{Math.min(currentPage * itemsPerPage, sorted.length)}</strong> of <strong style={{ color: '#ffffff' }}>{sorted.length}</strong> users
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                background: currentPage === 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                color: currentPage === 1 ? 'rgba(255,255,255,0.25)' : '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                background: currentPage === totalPages ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                color: currentPage === totalPages ? 'rgba(255,255,255,0.25)' : '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* User Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}

