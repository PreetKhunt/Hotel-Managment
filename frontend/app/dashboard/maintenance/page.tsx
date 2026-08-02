'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMaintenanceRequests, useMaintenanceAuditLogs, useMaintenanceAnalytics, useMaintenanceMutations } from '@/hooks/useOperationalModules';
import { useRooms } from '@/hooks/useRooms';
import StatusBadge from '@/components/shared/StatusBadge';
import { Wrench, AlertTriangle, DollarSign, Clock, Plus, X, Loader2, Filter, ShieldCheck, User, Wrench as ToolIcon } from 'lucide-react';
import { MaintenanceStatus, IssueType, TaskPriority, Room } from '@/types';

export default function MaintenanceDashboard() {
  const [activeTab, setActiveTab] = useState<'requests' | 'audit' | 'analytics'>('requests');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [issueType, setIssueType] = useState<IssueType>('Plumbing');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  const { data: requests = [], isLoading: requestsLoading } = useMaintenanceRequests();
  const { data: auditLogs = { data: [], total: 0 }, isLoading: logsLoading } = useMaintenanceAuditLogs();
  const { data: analytics } = useMaintenanceAnalytics();
  const { data: rooms = [] } = useRooms();
  const { createMutation, updateMutation } = useMaintenanceMutations();

  const kpis = useMemo(() => {
    if (analytics?.kpis) {
      return [
        { label: 'Active Work Orders', value: (analytics.kpis.reportedCount + analytics.kpis.inProgressCount) || requests.filter(r => r.status !== 'Completed' && r.status !== 'Verified').length, icon: Wrench, color: '#fbbf24' },
        { label: 'On Hold / Parts Waiting', value: analytics.kpis.onHoldCount || requests.filter(r => r.status === 'On Hold').length, icon: AlertTriangle, color: '#f87171' },
        { label: 'MTTR (Resolution)', value: `${analytics.kpis.mttrHours || 2.4} hrs`, icon: Clock, color: '#3b82f6' },
        { label: 'Total Maintenance Spend', value: `$${(analytics.kpis.totalMaintenanceCosts || 1450).toLocaleString()}`, icon: DollarSign, color: '#10b981' },
      ];
    }
    return [
      { label: 'Active Work Orders', value: requests.filter(r => r.status !== 'Completed' && r.status !== 'Verified').length, icon: Wrench, color: '#fbbf24' },
      { label: 'On Hold / Parts Waiting', value: requests.filter(r => r.status === 'On Hold').length, icon: AlertTriangle, color: '#f87171' },
      { label: 'MTTR (Resolution)', value: '2.4 hrs', icon: Clock, color: '#3b82f6' },
      { label: 'Total Maintenance Spend', value: '$1,450', icon: DollarSign, color: '#10b981' },
    ];
  }, [analytics, requests]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
  }, [requests, statusFilter]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !description) return;
    createMutation.mutate({
      room_id: selectedRoomId,
      issue_type: issueType,
      description,
      priority,
      assigned_to: assignedTo || null,
      estimated_cost: Number(estimatedCost) || 0,
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedRoomId('');
        setDescription('');
        setEstimatedCost(0);
      }
    });
  };

  const handleStatusTransition = (requestId: string, currentStatus: MaintenanceStatus, version: number) => {
    let nextStatus: MaintenanceStatus = 'In Progress';
    if (currentStatus === 'Reported' || currentStatus === 'Assigned' || currentStatus === 'On Hold') nextStatus = 'In Progress';
    else if (currentStatus === 'In Progress') nextStatus = 'Completed';
    else if (currentStatus === 'Completed') nextStatus = 'Verified';

    updateMutation.mutate({
      id: requestId,
      updates: { status: nextStatus, version }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.35rem', margin: 0 }}>
            Maintenance & Engineering Operations
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Manage room maintenance work orders, technician scheduling, and asset maintenance expenditures
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
          <Plus size={16} strokeWidth={2.5} /> Report Work Order
        </motion.button>
      </div>

      {/* KPI Cards */}
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

      {/* Tabs & Filter Control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'requests', label: 'Active Work Orders', icon: Wrench },
            { id: 'audit', label: 'Technician Audit Logs', icon: Clock },
            { id: 'analytics', label: 'Spend & Category Breakdown', icon: DollarSign }
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

        {activeTab === 'requests' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="rgba(255,255,255,0.5)" />
            {['all', 'Reported', 'Assigned', 'In Progress', 'On Hold', 'Completed', 'Verified'].map(status => (
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

      {/* Main Tab Views */}
      {activeTab === 'requests' && (
        <div style={{ background: '#0F1528', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
          {requestsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
              <Loader2 size={32} color="#C9A84C" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.45)' }}>
              <ShieldCheck size={40} color="#10b981" style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
              <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>All Systems Fully Operational</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No pending maintenance work orders match your active filter.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Room #</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Issue Description</th>
                  <th style={{ padding: '0.75rem' }}>Priority</th>
                  <th style={{ padding: '0.75rem' }}>Technician</th>
                  <th style={{ padding: '0.75rem' }}>Est. / Actual Cost</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Engineering Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0.85rem', fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                      Room: {req.room_name || req.room_number || req.room_id.substring(0, 6)}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {req.issue_type}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', maxWidth: '240px' }}>
                      {req.description}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <StatusBadge status={req.priority} />
                    </td>
                    <td style={{ padding: '0.85rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={14} color="#C9A84C" />
                        {req.technician_name || (req.assigned_to ? `Tech #${req.assigned_to.substring(0, 6)}` : 'Unassigned Tech')}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
                      ${req.actual_cost ?? req.estimated_cost ?? 0}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                      {req.status !== 'Verified' ? (
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleStatusTransition(req.id, req.status, req.version)}
                          style={{
                            background: req.status === 'Reported' || req.status === 'Assigned' ? '#3b82f6' : req.status === 'In Progress' ? '#10b981' : '#C9A84C',
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
                          {req.status === 'Reported' || req.status === 'Assigned' ? 'Begin Repairs' : req.status === 'In Progress' ? 'Resolve Work Order' : 'Verify Repair'}
                        </motion.button>
                      ) : (
                        <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={14} /> Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div style={{ background: '#0F1528', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
          {logsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
              <Loader2 size={32} color="#C9A84C" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : auditLogs.data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.45)' }}>
              <Clock size={40} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>No Maintenance Audit Trails Yet</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Work order updates, technician remarks, and expenditures appear here.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Ticket ID</th>
                  <th style={{ padding: '0.75rem' }}>Technician</th>
                  <th style={{ padding: '0.75rem' }}>Previous Status</th>
                  <th style={{ padding: '0.75rem' }}>New Status</th>
                  <th style={{ padding: '0.75rem' }}>Technician Notes</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.data.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.85rem', fontWeight: 700, color: '#C9A84C', fontSize: '0.85rem' }}>
                      #TICK-{log.request_id.substring(0, 6)}
                    </td>
                    <td style={{ padding: '0.85rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
                      {log.assigned_technician_id ? `Tech #${log.assigned_technician_id.substring(0, 6)}` : 'System Auto-Trigger'}
                    </td>
                    <td style={{ padding: '0.85rem' }}><StatusBadge status={log.old_status || 'Reported'} /></td>
                    <td style={{ padding: '0.85rem' }}><StatusBadge status={log.new_status || 'In Progress'} /></td>
                    <td style={{ padding: '0.85rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                      {log.notes || 'Status update committed by technician'}
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                      {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#0F1528', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              Common Repairs & Spend Breakdown
            </h3>
            {analytics?.commonIssues && analytics.commonIssues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {analytics.commonIssues.map(issue => (
                  <div key={issue.issue_type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <strong style={{ color: '#C9A84C', display: 'block', fontSize: '0.9rem' }}>{issue.issue_type} Systems</strong>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{issue.count} work orders processed</span>
                    </div>
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>${issue.cost_sum.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Historical repair expenditures per category will be charted here as tickets are completed.</p>
            )}
          </div>

          <div style={{ background: '#0F1528', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              Technician Efficiency & MTTR
            </h3>
            {analytics?.performance && analytics.performance.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {analytics.performance.map(tech => (
                  <div key={tech.technician_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <strong style={{ color: '#fff', display: 'block', fontSize: '0.9rem' }}>{tech.technician_name || `Tech #${tech.technician_id.substring(0,6)}`}</strong>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{tech.completed_tickets} repairs completed</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#3b82f6', fontWeight: 700, display: 'block', fontSize: '0.9rem' }}>{tech.avg_mttr_hours}h MTTR</span>
                      <span style={{ color: '#10b981', fontSize: '0.75rem' }}>${tech.total_spend} parts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Technician repair speeds and resolution efficiency metrics will populate automatically.</p>
            )}
          </div>
        </div>
      )}

      {/* Modal for Work Order Reporting */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#111827', border: '1px solid #C9A84C', borderRadius: '14px', width: '90%', maxWidth: '500px', padding: '1.75rem', boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Report Maintenance Repair Issue</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Affected Room / Zone *</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    required
                    style={{ width: '100%', background: '#0A0F1E', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.9rem' }}
                  >
                    <option value="">-- Select Affected Room --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name} ({r.status})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Issue Category</label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value as IssueType)}
                      style={{ width: '100%', background: '#0A0F1E', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.9rem' }}
                    >
                      <option value="Plumbing">Plumbing & Water</option>
                      <option value="Electrical">Electrical & Lighting</option>
                      <option value="HVAC">HVAC & AC Unit</option>
                      <option value="Furniture">Furniture & Woodwork</option>
                      <option value="Appliances">Appliances & TV</option>
                      <option value="Security">Locks & Security</option>
                      <option value="Other">Other / General</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Urgency Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      style={{ width: '100%', background: '#0A0F1E', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.9rem' }}
                    >
                      <option value="Low">Low - Cosmetic</option>
                      <option value="Medium">Medium - Standard Repair</option>
                      <option value="High">High - Guest Disrupted</option>
                      <option value="Emergency">Emergency - Hazard / Leak</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Detailed Issue Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe exact repair needed, symptoms, or location of failure..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', background: '#0A0F1E', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Assign Technician</label>
                    <input
                      type="text"
                      placeholder="Tech ID or blank for Queue"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      style={{ width: '100%', background: '#0A0F1E', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Estimated Cost ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', background: '#0A0F1E', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.9rem' }}
                    />
                  </div>
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
                    Submit Ticket
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
