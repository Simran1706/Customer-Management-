import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatCard from '../components/StatCard';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Edit2,
  Power,
  RefreshCw,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    recentRegistrations: 0
  });

  // Table state
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' (all), 'active', 'inactive'

  // Alert State
  const [alert, setAlert] = useState(null);

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [customerToToggle, setCustomerToToggle] = useState(null);

  // Edit Customer Form State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });
  const [editErrors, setEditErrors] = useState({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const res = await api.get('/admin/metrics');
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err.message);
    }
  };

  // Fetch customers with debounce search & pagination
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm.trim() || undefined,
        status: statusFilter || undefined
      };

      const res = await api.get('/admin/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data.customers);
        setPagination((prev) => ({
          ...prev,
          total: res.data.data.pagination.total,
          totalPages: res.data.data.pagination.totalPages,
          page: res.data.data.pagination.page
        }));
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load customer list.'
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle Search Input with reset to page 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle Status Filter Change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Open View Modal
  const handleOpenViewModal = (cust) => {
    setSelectedCustomer(cust);
    setIsViewModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cust) => {
    setSelectedCustomer(cust);
    setEditForm({
      name: cust.name || '',
      email: cust.email || '',
      phone: cust.phone || '',
      address: cust.address || '',
      status: cust.status || 'active'
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  // Validate Edit Form
  const validateEditForm = () => {
    const errs = {};
    const nameTrimmed = (editForm.name || '').trim();
    if (!nameTrimmed) {
      errs.name = 'Full name is required';
    } else if (nameTrimmed.length < 2) {
      errs.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s.]+$/.test(nameTrimmed)) {
      errs.name = 'Name can only contain alphabetic letters and spaces';
    }

    if (!editForm.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(editForm.email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    const digits = (editForm.phone || '').replace(/\D/g, '');
    if (!digits) {
      errs.phone = '10-digit mobile number is required';
    } else if (digits.length !== 10) {
      errs.phone = `Phone number must be exactly 10 digits (currently ${digits.length}/10)`;
    } else if (!/^[6-9]\d{9}$/.test(digits)) {
      errs.phone = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9';
    }

    const addressTrimmed = (editForm.address || '').trim();
    if (!addressTrimmed) {
      errs.address = 'Physical address is required';
    } else if (addressTrimmed.length < 8) {
      errs.address = 'Address must be at least 8 characters';
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Edit Customer
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setIsSavingEdit(true);
    try {
      const res = await api.put(`/admin/customers/${selectedCustomer._id}`, editForm);
      if (res.data.success) {
        setAlert({
          type: 'success',
          message: `Customer ${editForm.name} updated successfully.`
        });
        setIsEditModalOpen(false);
        fetchCustomers();
        fetchMetrics();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update customer information.'
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Trigger Status Toggle Dialog
  const handlePromptStatusToggle = (cust) => {
    setCustomerToToggle(cust);
    setIsStatusConfirmOpen(true);
  };

  // Confirm Status Toggle
  const handleConfirmStatusToggle = async () => {
    if (!customerToToggle) return;
    try {
      const targetStatus = customerToToggle.status === 'active' ? 'inactive' : 'active';
      const res = await api.patch(`/admin/customers/${customerToToggle._id}/status`, {
        status: targetStatus
      });

      if (res.data.success) {
        setAlert({
          type: 'success',
          message: `Customer ${customerToToggle.name} has been ${targetStatus === 'active' ? 'activated' : 'deactivated'}.`
        });
        fetchCustomers();
        fetchMetrics();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to toggle customer status.'
      });
    } finally {
      setIsStatusConfirmOpen(false);
      setCustomerToToggle(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                Root Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Logged in as <strong className="text-slate-700">{user?.email}</strong>. Complete
              oversight of customer accounts, security status, and system records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchMetrics();
                fetchCustomers();
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              Logout
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}

        {/* Metric Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Customers"
            value={metrics.totalCustomers}
            icon={Users}
            color="brand"
            subtext="Registered customer database count"
          />
          <StatCard
            title="Active Accounts"
            value={metrics.activeCustomers}
            icon={UserCheck}
            color="emerald"
            subtext="Accounts eligible to log in and transact"
          />
          <StatCard
            title="Inactive Accounts"
            value={metrics.inactiveCustomers}
            icon={UserX}
            color="rose"
            subtext="Deactivated by administration"
          />
          <StatCard
            title="Recent Signups"
            value={metrics.recentRegistrations}
            icon={TrendingUp}
            color="amber"
            subtext="New customers registered in last 30 days"
          />
        </div>

        {/* Customer Management Table Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Controls Bar: Search & Status Filter */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Customer Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Search, inspect, edit details, and modify status for any customer account
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative min-w-[260px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50/50 hover:border-slate-300 transition"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange('')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    statusFilter === ''
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({metrics.totalCustomers})
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange('active')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    statusFilter === 'active'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  Active ({metrics.activeCustomers})
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange('inactive')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    statusFilter === 'inactive'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  Inactive ({metrics.inactiveCustomers})
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Customer Name & Email
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Joined Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right sticky right-0 bg-slate-50/95 backdrop-blur-sm shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                        <span className="text-xs font-medium">Fetching customer records...</span>
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Users className="w-10 h-10 stroke-[1.5]" />
                        <p className="text-sm font-semibold text-slate-700">No customers found</p>
                        <p className="text-xs text-slate-500 max-w-sm">
                          {searchTerm || statusFilter
                            ? 'No customer records matched your search filters. Try clearing the query or filter.'
                            : 'There are no customers currently registered in the database.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => (
                    <tr
                      key={cust._id}
                      className="hover:bg-slate-50/60 transition-colors duration-150"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                            {cust.name ? cust.name[0] : 'C'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{cust.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {cust.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {cust.phone}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate" title={cust.address}>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{cust.address}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            cust.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cust.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {cust.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(cust.createdAt)}
                        </div>
                      </td>

                      {/* Action buttons (Sticky on right so never cut off) */}
                      <td className="px-6 py-4 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-sm shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-end gap-2">
                          {/* View details */}
                          <button
                            onClick={() => handleOpenViewModal(cust)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition text-xs font-semibold flex items-center gap-1 shadow-sm"
                            title="View Customer Details"
                            aria-label={`View ${cust.name}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {/* Edit details */}
                          <button
                            onClick={() => handleOpenEditModal(cust)}
                            className="px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition text-xs font-semibold flex items-center gap-1 shadow-sm"
                            title="Edit Customer Information"
                            aria-label={`Edit ${cust.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Activate / Deactivate toggle */}
                          <button
                            onClick={() => handlePromptStatusToggle(cust)}
                            className={`px-2.5 py-1.5 rounded-lg border transition text-xs font-semibold flex items-center gap-1 shadow-sm ${
                              cust.status === 'active'
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300'
                            }`}
                            title={
                              cust.status === 'active'
                                ? 'Deactivate Customer Account'
                                : 'Activate Customer Account'
                            }
                            aria-label={`Toggle ${cust.name} status`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{cust.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
            onPageSizeChange={(newLimit) =>
              setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }))
            }
          />
        </div>
      </div>

      {/* VIEW CUSTOMER DETAILS MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Customer Record Details"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl uppercase shadow-md shadow-brand-500/20">
                {selectedCustomer.name ? selectedCustomer.name[0] : 'C'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      selectedCustomer.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {selectedCustomer.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Database ID: {selectedCustomer._id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Email Address
                </span>
                <span className="font-medium text-slate-900 break-all">
                  {selectedCustomer.email}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Phone Number
                </span>
                <span className="font-medium text-slate-900">{selectedCustomer.phone}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 sm:col-span-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Physical Address
                </span>
                <span className="font-medium text-slate-900 leading-relaxed">
                  {selectedCustomer.address}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Registration Date
                </span>
                <span className="font-medium text-slate-900">
                  {new Date(selectedCustomer.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Last Updated
                </span>
                <span className="font-medium text-slate-900">
                  {new Date(selectedCustomer.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEditModal(selectedCustomer);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Customer
              </button>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* EDIT CUSTOMER INFORMATION MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Customer Details"
      >
        <form onSubmit={handleSaveEdit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border transition ${
                editErrors.name ? 'border-rose-400 focus:ring-1 focus:ring-rose-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
              }`}
            />
            {editErrors.name && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{editErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border transition ${
                editErrors.email ? 'border-rose-400 focus:ring-1 focus:ring-rose-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
              }`}
            />
            {editErrors.email && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{editErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                {editForm.phone.length}/10 digits
              </span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={editForm.phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                setEditForm({ ...editForm, phone: digits });
                if (editErrors.phone) setEditErrors({ ...editErrors, phone: '' });
              }}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border font-mono transition ${
                editErrors.phone ? 'border-rose-400 focus:ring-1 focus:ring-rose-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
              }`}
            />
            {editErrors.phone && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{editErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Physical Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border transition ${
                editErrors.address ? 'border-rose-400 focus:ring-1 focus:ring-rose-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
              }`}
            />
            {editErrors.address && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{editErrors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Account Status
            </label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-1 focus:ring-brand-500 bg-white"
            >
              <option value="active">Active (Can log in)</option>
              <option value="inactive">Inactive (Deactivated)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingEdit}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSavingEdit ? 'Saving...' : 'Save Customer Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM STATUS TOGGLE MODAL */}
      <Modal
        isOpen={isStatusConfirmOpen}
        onClose={() => setIsStatusConfirmOpen(false)}
        title="Confirm Account Status Change"
        maxWidth="max-w-md"
      >
        {customerToToggle && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-xs font-medium leading-relaxed">
                You are about to{' '}
                <strong>
                  {customerToToggle.status === 'active' ? 'DEACTIVATE' : 'ACTIVATE'}
                </strong>{' '}
                customer account: <span className="underline">{customerToToggle.name}</span>.
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {customerToToggle.status === 'active'
                ? 'Deactivated customers will be immediately barred from logging in and accessing their profile.'
                : 'Activating this customer will restore their login access and portal permissions.'}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStatusConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusToggle}
                className={`px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm transition ${
                  customerToToggle.status === 'active'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirm {customerToToggle.status === 'active' ? 'Deactivation' : 'Activation'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
