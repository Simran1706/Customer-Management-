import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import Alert from '../components/Alert';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Calendar,
  ShieldCheck,
  Edit3,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'edit' | 'password'
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Edit Profile Form State
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch logged in customer's profile from /api/customer/profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/profile');
      if (res.data.success) {
        setProfile(res.data.data);
        setEditData({
          name: res.data.data.name || '',
          phone: res.data.data.phone || '',
          address: res.data.data.address || ''
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load customer profile.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Validate Edit Profile
  const validateEdit = () => {
    const errs = {};
    const nameTrimmed = (editData.name || '').trim();
    if (!nameTrimmed) {
      errs.name = 'Full name is required';
    } else if (nameTrimmed.length < 2) {
      errs.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s.]+$/.test(nameTrimmed)) {
      errs.name = 'Name can only contain alphabetic letters and spaces';
    }

    const digits = (editData.phone || '').replace(/\D/g, '');
    if (!digits) {
      errs.phone = '10-digit mobile number is required';
    } else if (digits.length !== 10) {
      errs.phone = `Phone number must be exactly 10 digits (currently ${digits.length}/10)`;
    } else if (!/^[6-9]\d{9}$/.test(digits)) {
      errs.phone = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9';
    }

    const addressTrimmed = (editData.address || '').trim();
    if (!addressTrimmed) {
      errs.address = 'Physical address is required';
    } else if (addressTrimmed.length < 8) {
      errs.address = 'Address must be at least 8 characters';
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Profile Updates
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateEdit()) return;

    setIsUpdatingProfile(true);
    setAlert(null);

    try {
      const res = await api.put('/customer/profile', {
        name: editData.name.trim(),
        phone: editData.phone.trim(),
        address: editData.address.trim()
      });

      if (res.data.success) {
        setProfile(res.data.data);
        updateUser({
          name: res.data.data.name,
          phone: res.data.data.phone,
          address: res.data.data.address
        });
        setAlert({
          type: 'success',
          message: 'Profile information updated successfully!'
        });
        setActiveTab('overview');
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Validate Change Password
  const validatePassword = () => {
    const errs = {};
    if (!passwordData.currentPassword) {
      errs.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errs.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errs.newPassword = 'New password must be at least 6 characters';
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errs.newPassword = 'New password cannot be the same as current password';
    }

    if (!passwordData.confirmNewPassword) {
      errs.confirmNewPassword = 'Confirm new password is required';
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      errs.confirmNewPassword = 'New passwords do not match';
    }

    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsChangingPassword(true);
    setAlert(null);

    try {
      const res = await api.put('/customer/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword
      });

      if (res.data.success) {
        setAlert({
          type: 'success',
          message: res.data.message || 'Password changed successfully!'
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        setActiveTab('overview');
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to change password.'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-bold text-white shadow-inner">
                {profile?.name ? profile.name[0].toUpperCase() : 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{profile?.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {profile?.status === 'active' ? 'Active Member' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> {profile?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Global Alert Notification */}
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setActiveTab('overview');
              setAlert(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl transition border-b-2 -mb-[1px] whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            Profile Overview
          </button>

          <button
            onClick={() => {
              setActiveTab('edit');
              setAlert(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl transition border-b-2 -mb-[1px] whitespace-nowrap ${
              activeTab === 'edit'
                ? 'border-brand-600 text-brand-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>

          <button
            onClick={() => {
              setActiveTab('password');
              setAlert(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl transition border-b-2 -mb-[1px] whitespace-nowrap ${
              activeTab === 'password'
                ? 'border-brand-600 text-brand-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Change Password
          </button>
        </div>

        {/* TAB 1: Profile Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your verified customer profile recorded in our database
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('edit')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 text-brand-600 hover:bg-brand-100 border border-brand-200 transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Details
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    <User className="w-3.5 h-3.5 text-brand-500" /> Full Name
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{profile?.name}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    <Mail className="w-3.5 h-3.5 text-brand-500" /> Email Address
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{profile?.email}</p>
                  <span className="text-[10px] text-slate-400">Primary authentication identifier</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    <Phone className="w-3.5 h-3.5 text-brand-500" /> Contact Phone
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{profile?.phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" /> Member Since
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(profile?.createdAt)}
                  </p>
                </div>

                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" /> Physical Address
                  </div>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {profile?.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Security & Privacy Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Data Isolation Guarantee</h3>
                    <p className="text-xs text-slate-500">End-to-End Privacy</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your customer data is strictly isolated. Backend security middleware verifies
                  cryptographic JWT signatures on every request, ensuring that no other customer can
                  view or modify your profile.
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Account ID</span>
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {profile?.id || profile?._id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Role Status</span>
                    <span className="text-emerald-600 font-semibold uppercase text-[11px]">
                      {profile?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Password Action Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Account Security</h3>
                    <p className="text-xs text-slate-500">Password Management</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Need to update your password? You can change it anytime with your current credentials.
                </p>
                <button
                  onClick={() => setActiveTab('password')}
                  className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:text-brand-600 text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Go to Password Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Edit Allowed Information */}
        {activeTab === 'edit' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">Update Allowed Information</h2>
              <p className="text-xs text-slate-500 mt-1">
                You can update your Full Name, Phone number, and Physical Address. Email is tied to
                your identity and can only be altered by a Super Admin.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} noValidate className="space-y-5">
              {/* Email (Read-Only) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address (Non-Editable)
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="editName"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="editName"
                  type="text"
                  value={editData.name}
                  onChange={(e) => {
                    setEditData({ ...editData, name: e.target.value });
                    if (editErrors.name) setEditErrors({ ...editErrors, name: '' });
                  }}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                    editErrors.name
                      ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                  }`}
                />
                {editErrors.name && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{editErrors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="editPhone"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-500">
                    {editData.phone.length}/10 digits
                  </span>
                </div>
                <input
                  id="editPhone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={editData.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setEditData({ ...editData, phone: digits });
                    if (editErrors.phone) setEditErrors({ ...editErrors, phone: '' });
                  }}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white font-mono transition ${
                    editErrors.phone
                      ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                  }`}
                />
                {editErrors.phone && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{editErrors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="editAddress"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Physical Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="editAddress"
                  rows={3}
                  value={editData.address}
                  onChange={(e) => {
                    setEditData({ ...editData, address: e.target.value });
                    if (editErrors.address) setEditErrors({ ...editErrors, address: '' });
                  }}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                    editErrors.address
                      ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                  }`}
                />
                {editErrors.address && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{editErrors.address}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Change Password */}
        {activeTab === 'password' && (
          <div className="max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide your current password to verify identity, then set your new password.
              </p>
            </div>

            <form onSubmit={handleChangePassword} noValidate className="space-y-5">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, currentPassword: e.target.value });
                      if (passwordErrors.currentPassword)
                        setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                    }}
                    className={`w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                      passwordErrors.currentPassword
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, newPassword: e.target.value });
                      if (passwordErrors.newPassword)
                        setPasswordErrors({ ...passwordErrors, newPassword: '' });
                    }}
                    className={`w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                      passwordErrors.newPassword
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmNewPassword"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={passwordData.confirmNewPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, confirmNewPassword: e.target.value });
                      if (passwordErrors.confirmNewPassword)
                        setPasswordErrors({ ...passwordErrors, confirmNewPassword: '' });
                    }}
                    className={`w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                      passwordErrors.confirmNewPassword
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmNewPassword && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {passwordErrors.confirmNewPassword}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
