'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHousekeepingTasks, useHousekeepingHistory, useHousekeepingAnalytics, useHousekeepingMutations } from '@/hooks/useOperationalModules';
import { useRooms } from '@/hooks/useRooms';
import StatusBadge from '@/components/shared/StatusBadge';
import { Brush, CheckCircle, Clock, AlertTriangle, Plus, X, Loader2, Sparkles, User, Filter } from 'lucide-react';
import { HousekeepingStatus, TaskPriority, Room } from '@/types';

export default function HousekeepingDashboard() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'rooms' | 'history'>('tasks');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State for assigning tasks
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [remarks, setRemarks] = useState('');

  const { data: tasks = [], isLoading: tasksLoading } = useHousekeepingTasks();
  const { data: history = { data: [], total: 0 }, isLoading: historyLoading } = useHousekeepingHistory();
  const { data: analytics } = useHousekeepingAnalytics();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { createMutation, updateStatusMutation } = useHousekeepingMutations();

  const kpis = useMemo(() => {
    if (analytics?.kpis) {
      return [
        { label: 'Clean Rooms', value: analytics.kpis.cleanCount || rooms.filter(r => (r.status as string)?.toLowerCase() === 'clean' || r.status === 'available').length, icon: CheckCircle, color: '#34d399' },
        { label: 'Dirty Rooms', value: analytics.kpis.dirtyCount || rooms.filter(r => (r.status as string)?.toLowerCase() === 'dirty' || (r.status as string)?.toLowerCase() === 'checked-out').length, icon: AlertTriangle, color: '#f87171' },
        { label: 'Under Cleaning', value: analytics.kpis.underCleaningCount || rooms.filter(r => (r.status as string)?.toLowerCase() === 'under cleaning').length, icon: Brush, color: '#3b82f6' },
        { label: 'Avg Turnaround', value: `${analytics.kpis.avgTurnaroundMinutes || 24} min`, icon: Clock, color: '#C9A84C' },
      ];
    }
    return [
      { label: 'Clean Rooms', value: rooms.filter(r => r.status === 'available' || (r.status as any) === 'clean').length, icon: CheckCircle, color: '#34d399' },
      { label: 'Dirty / Turnover', value: tasks.filter(t => t.status === 'Pending').length, icon: AlertTriangle, color: '#f87171' },
      { label: 'Under Cleaning', value: tasks.filter(t => t.status === 'In Progress').length, icon: Brush, color: '#3b82f6' },
      { label: 'Avg Turnaround', value: '25 min', icon: Clock, color: '#C9A84C' },
    ];
  }, [analytics, rooms, tasks]);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return tasks;
    return tasks.filter(t => t.status.toLowerCase() === statusFilter.toLowerCase());
  }, [tasks, statusFilter]);

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return;
    createMutation.mutate({
      room_id: selectedRoomId,
      assigned_to: assignedTo || null,
      priority,
      remarks,
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedRoomId('');
        setRemarks('');
      }
    });
  };

  const handleQuickAction = (taskId: string, currentStatus: HousekeepingStatus, version: number) => {
    let nextStatus: HousekeepingStatus = 'In Progress';
    if (currentStatus === 'Pending') nextStatus = 'In Progress';
    else if (currentStatus === 'In Progress') nextStatus = 'Completed';
    else if (currentStatus === 'Completed') nextStatus = 'Verified';
    
    updateStatusMutation.mutate({
      id: taskId,
      updates: { status: nextStatus, version }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.35rem', margin: 0 }}>
            Housekeeping Command Center
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Real-time room turnover operations, cleaning workflows, and staff timing audit
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #C9A84C, #9a7b2c)',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(201,168,76,0.25)'
          }}
        >
          <Plus size={16} strokeWidth={2.5} /> Assign Cleaning Task
        </motion.button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {kpis.map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'linear-gradient(145deg, #111827, #0A0F1E)',
                border: '1px solid rgba(201,168,76,0.18)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.15rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${stat.color}15`, border: `1px solid ${stat.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <IconComponent size={24} color={stat.color} />
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </span>
                <h3 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 700, margin: '0.2rem 0 0 0' }}>
                  {stat.value}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tab Controls & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'tasks', label: 'Active Cleaning Tasks', icon: Brush },
            { id: 'rooms', label: 'Room Status Matrix', icon: Sparkles },
            { id: 'history', label: 'Turnaround Audit History', icon: Clock }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: isActive ? 'rgba(201,168,76,0.15)' : 'transparent',
                  color: isActive ? '#C9A84C' : 'rgba(255,255,255,0.6)',
                  border: isActive ? '1px solid rgba(201,168,76,0.35)' : '1px solid transparent',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.2s'
                }}
              >
                <TabIcon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="rgba(255,255,255,0.5)" />
            {['all', 'Pending', 'In Progress', 'Completed', 'Verified'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  background: statusFilter === status ? '#C9A84C' : 'rgba(255,255,255,0.05)',
                  color: statusFilter === status ? '#0A0F1E' : 'rgba(255,255,255,0.7)',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Areas */}
      {activeTab === 'tasks' && (
        <div style={{ background: '#0F1528', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
          {tasksLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
              <Loader2 size={32} color="#C9A84C" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.45)' }}>
              <CheckCircle size={40} color="#34d399" style={{ margin: '0 auto 1rem opacity: 0.6' }} />
              <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>No Housekeeping Tasks Require Attention</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>All hotel rooms match current cleanliness filters.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Room #</th>
                  <th style={{ padding: '0.75rem' }}>Priority</th>
                  <th style={{ padding: '0.75rem' }}>Assigned Staff</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Remarks</th>
                  <th style={{ padding: '0.75rem' }}>Time Elapsed</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Workflow Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const elMin = task.started_at ? Math.round((Date.now() - new Date(task.started_at).getTime()) / 60000) : null;
                  return (
                    <tr key={task.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '0.85rem', fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                        Room: {task.room_name || task.room_number || task.room_id.substring(0, 6)}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <StatusBadge status={task.priority} />
                      </td>
                      <td style={{ padding: '0.85rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={14} color="#C9A84C" />
                          {task.assigned_name || (task.assigned_to ? `Staff #${task.assigned_to.substring(0, 6)}` : 'Unassigned (General Pool)')}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <StatusBadge status={task.status} />
                      </td>
                      <td style={{ padding: '0.85rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', maxWidth: '240px' }}>
                        {task.remarks || 'Standard daily room clean & bed linen change'}
                      </td>
                      <td style={{ padding: '0.85rem', color: elMin ? '#C9A84C' : 'rgba(255,255,255,0.4)', fontSize: '0.82rem', fontWeight: 600 }}>
                        {elMin !== null ? `${elMin} min in progress` : 'Not started yet'}
                      </td>
                      <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                        {task.status !== 'Verified' && (
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleQuickAction(task.id, task.status, task.version)}
                            style={{
                              background: task.status === 'Pending' ? '#3b82f6' : task.status === 'In Progress' ? '#10b981' : '#C9A84C',
                              color: '#0A0F1E',
                              border: 'none',
                              padding: '0.45rem 0.85rem',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}
                          >
                            {task.status === 'Pending' ? 'Start Cleaning' : task.status === 'In Progress' ? 'Mark Completed' : 'Verify & Ready'}
                          </motion.button>
                        )}
                        {task.status === 'Verified' && (
                          <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> Ready for Guest
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'rooms' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {roomsLoading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <Loader2 size={32} color="#C9A84C" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                style={{
                  background: 'linear-gradient(145deg, #111827, #0D1322)',
                  border: '1px solid rgba(201,168,76,0.15)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{room.name}</span>
                  <StatusBadge status={room.status} />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                  Type: <strong style={{ color: '#C9A84C', textTransform: 'capitalize' }}>{room.type}</strong> | Floor: <strong>{room.floor || 1}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      setIsModalOpen(true);
                    }}
                    style={{
                      background: 'rgba(201,168,76,0.12)',
                      color: '#C9A84C',
                      border: '1px solid rgba(201,168,76,0.3)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.22)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.12)')}
                  >
                    Request Housekeeping Service
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ background: '#0F1528', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
          {historyLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
              <Loader2 size={32} color="#C9A84C" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : history.data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.45)' }}>
              <Clock size={40} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>No Historical Cleaning Logs Found</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Completed and verified turnover records will be archived here.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Room #</th>
                  <th style={{ padding: '0.75rem' }}>Completed By</th>
                  <th style={{ padding: '0.75rem' }}>Turnaround Time</th>
                  <th style={{ padding: '0.75rem' }}>Remarks</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Date Completed</th>
                </tr>
              </thead>
              <tbody>
                {history.data.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.85rem', fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                      Room: {rec.room_name || rec.room_number || rec.room_id.substring(0, 6)}
                    </td>
                    <td style={{ padding: '0.85rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
                      {rec.staff_name || `Staff #${rec.completed_by.substring(0, 6)}`}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {rec.time_taken_minutes} minutes
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                      {rec.remarks || 'Standard cleaning verification complete'}
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                      {new Date(rec.completed_at).toLocaleDateString()} {new Date(rec.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal for Assigning Task */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#111827', border: '1px solid #C9A84C', borderRadius: '14px', width: '90%', maxWidth: '480px', padding: '1.75rem', boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Assign Cleaning / Turnover Task</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Target Room *</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    required
                    style={{ width: '100%', background: '#0A0F1E', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.9rem' }}
                  >
                    <option value="">-- Select Room --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name} ({r.status})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Turnaround Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    style={{ width: '100%', background: '#0A0F1E', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.9rem' }}
                  >
                    <option value="Low">Low - Daily Refresh</option>
                    <option value="Medium">Medium - Standard Turnover</option>
                    <option value="High">High - Priority Guest Check-In</option>
                    <option value="Emergency">Emergency - Immediate Deep Clean</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Assign Staff Member (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter staff ID or leave blank for General Pool"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    style={{ width: '100%', background: '#0A0F1E', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Cleaning Instructions / Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Extra pillows requested, replace towels and amenities..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    style={{ width: '100%', background: '#0A0F1E', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.65rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #9a7b2c)', color: '#0A0F1E', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Dispatch Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
