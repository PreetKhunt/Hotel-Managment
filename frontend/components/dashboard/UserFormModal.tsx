'use client';

import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, AlertCircle, Shield, User as UserIcon, Mail, Phone, Lock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { z } from 'zod';
import toast from 'react-hot-toast';

interface UserFormModalProps {
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const userSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please provide a valid email address'),
  phone: z.string().optional(),
  roleName: z.enum(['Manager', 'Receptionist', 'Admin', 'Staff', 'Guest']),
  status: z.enum(['active', 'inactive', 'suspended']),
  password: z.string().optional(),
});

const UserFormModal: FC<UserFormModalProps> = ({ user, isOpen, onClose }) => {
  const isEditing = !!user;
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    roleName: 'Staff' as 'Manager' | 'Receptionist' | 'Admin' | 'Staff' | 'Guest',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || user.firstName || '',
        last_name: user.last_name || user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        roleName: (user.role?.name as any) || 'Staff',
        status: (user.status as any) || 'active',
        password: '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        roleName: 'Staff',
        status: 'active',
        password: '',
      });
    }
    setErrors({});
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = userSchema.safeParse(formData);
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(formattedErrors);
      toast.error('Please resolve validation errors');
      return;
    }

    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      setErrors({ password: 'Password of at least 6 characters is required for new users' });
      toast.error('Password is required for new accounts');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        email: formData.email,
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone,
        roleName: formData.roleName,
        status: formData.status,
      };

      if (formData.password && formData.password.trim() !== '') {
        payload.password = formData.password.trim();
      }

      if (isEditing) {
        await api.put(`/users/${user.id}`, payload);
        toast.success('User updated successfully!');
      } else {
        await api.post('/users', payload);
        toast.success('New user account created!');
      }

      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'An error occurred while saving user';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    background: '#0F1626',
    border: `1px solid ${hasError ? '#f87171' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '0.88rem',
    padding: '0.65rem 0.85rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.75)',
    fontSize: '0.82rem',
    fontWeight: 600,
    marginBottom: '0.4rem',
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          style={{
            background: '#1A2235',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(201,168,76,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={20} color="#C9A84C" />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#ffffff', fontWeight: 700, fontSize: '1.15rem' }}>
                  {isEditing ? `Edit User: ${user.first_name} ${user.last_name}` : 'Create New User Account'}
                </h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  {isEditing ? 'Modify staff profiles and role allocations' : 'Provision credentials and access roles'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Names */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>
                    <UserIcon size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    style={inputStyle(!!errors.first_name)}
                    placeholder="e.g. Elena"
                  />
                  {errors.first_name && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.first_name}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    style={inputStyle(!!errors.last_name)}
                    placeholder="e.g. Vance"
                  />
                  {errors.last_name && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.last_name}</span>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>
                  <Mail size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                  Email Address *
                </label>
                <input
                  type="email"
                  disabled={isEditing}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  style={{
                    ...inputStyle(!!errors.email),
                    background: isEditing ? 'rgba(255,255,255,0.03)' : '#0F1626',
                    cursor: isEditing ? 'not-allowed' : 'text',
                    opacity: isEditing ? 0.7 : 1,
                  }}
                  placeholder="elena.vance@hospitalityhub.com"
                />
                {errors.email && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.email}</span>}
                {isEditing && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.73rem', display: 'block', marginTop: '0.25rem' }}>Email address cannot be modified after account creation.</span>}
              </div>

              {/* Role & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Assigned Role</label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => handleChange('roleName', e.target.value)}
                    style={inputStyle(false)}
                  >
                    <option value="Manager">Manager</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="Guest">Guest</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    style={inputStyle(false)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>
                  <Phone size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                  Contact Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  style={inputStyle(false)}
                  placeholder="+1 (555) 345-6789"
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>
                  <Lock size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                  {isEditing ? 'New Password (leave blank to keep unchanged)' : 'Initial Account Password *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  style={inputStyle(!!errors.password)}
                  placeholder={isEditing ? '••••••••••••' : 'Enter strong initial password...'}
                />
                {errors.password && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>{errors.password}</span>}
              </div>

            </div>

            {/* Footer Buttons */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: '#151C2C',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: 'auto',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '0.6rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #C9A84C, #a8863c)',
                  color: '#0A0F1E',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.4rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {isEditing ? 'Save Changes' : 'Create Account'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserFormModal;
