import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound, Info } from 'lucide-react';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (alert) setAlert(null);
  };

  const handleFillDemo = () => {
    setFormData({
      email: 'admin@crm.com',
      password: 'Admin@12345'
    });
    setErrors({});
    setAlert({
      type: 'info',
      message: 'Default Super Admin credentials populated. Click "Authorize Super Admin" to proceed.'
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Valid email format required';
    }

    if (!formData.password) {
      errs.password = 'Admin password is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setAlert(null);

    const result = await login(formData.email.trim(), formData.password, 'admin');

    setIsSubmitting(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setAlert({
        type: 'error',
        message: result.message
      });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-100">
      <div className="max-w-md w-full space-y-8 bg-slate-800/90 border border-slate-700/80 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/30 mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Super Admin Console</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Restricted access. Super administrator privileges are required to manage accounts.
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Helper */}
        <div className="p-3.5 rounded-xl bg-slate-700/50 border border-slate-600/60 flex items-start justify-between gap-3">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-brand-300 flex items-center gap-1 mb-1">
              <KeyRound className="w-3.5 h-3.5" /> Demo Admin Credentials:
            </span>
            <div className="font-mono text-[11px] text-slate-300">
              admin@crm.com / Admin@12345
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-semibold transition shrink-0"
          >
            Auto Fill
          </button>
        </div>

        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Super Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@crm.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-900/60 text-white placeholder-slate-500 transition ${
                  errors.email
                    ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-700 hover:border-slate-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Master Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-slate-900/60 text-white placeholder-slate-500 transition ${
                  errors.password
                    ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-700 hover:border-slate-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying Administrator Privileges...</span>
              </>
            ) : (
              <>
                <span>Authorize Super Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-700/60 text-center text-xs text-slate-400">
          Looking for customer portal?{' '}
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">
            Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
