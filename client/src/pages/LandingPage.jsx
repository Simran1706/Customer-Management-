import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import {
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  User,
  Check,
  XCircle,
  AlertCircle
} from 'lucide-react';

const LandingPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null); // { type, message }

  // Individual Field Validator
  const validateField = (fieldName, value, allValues = formData) => {
    let error = '';

    switch (fieldName) {
      case 'name': {
        const trimmed = (value || '').trim();
        if (!trimmed) {
          error = 'Full name is required';
        } else if (trimmed.length < 2) {
          error = 'Name must be at least 2 characters long';
        } else if (trimmed.length > 60) {
          error = 'Name cannot exceed 60 characters';
        } else if (!/^[a-zA-Z\s.]+$/.test(trimmed)) {
          error = 'Name can only contain alphabetic letters and spaces (no numbers)';
        }
        break;
      }

      case 'email': {
        const trimmed = (value || '').trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!trimmed) {
          error = 'Email address is required';
        } else if (!emailRegex.test(trimmed)) {
          error = 'Please enter a valid email address (e.g. name@example.com)';
        }
        break;
      }

      case 'phone': {
        const digits = (value || '').replace(/\D/g, '');
        if (!digits) {
          error = '10-digit mobile number is required';
        } else if (digits.length !== 10) {
          error = `Phone number must be exactly 10 digits (currently ${digits.length}/10)`;
        } else if (!/^[6-9]\d{9}$/.test(digits)) {
          error = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9';
        }
        break;
      }

      case 'address': {
        const trimmed = (value || '').trim();
        if (!trimmed) {
          error = 'Physical address is required';
        } else if (trimmed.length < 8) {
          error = `Address must be at least 8 characters (currently ${trimmed.length}/8)`;
        } else if (trimmed.length > 300) {
          error = 'Address cannot exceed 300 characters';
        }
        break;
      }

      case 'password': {
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters long';
        }
        break;
      }

      case 'confirmPassword': {
        if (!value) {
          error = 'Confirm Password is required';
        } else if (value !== allValues.password) {
          error = 'Passwords do not match';
        }
        break;
      }

      default:
        break;
    }

    return error;
  };

  // Handle Input Changes with strict filtering & real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Strict input filtering
    if (name === 'phone') {
      // Only keep digits and cap at exactly 10 digits
      sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'name') {
      // Prevent typing digits or special symbols in name
      sanitizedValue = value.replace(/[^a-zA-Z\s.]/g, '');
    }

    const updatedFormData = { ...formData, [name]: sanitizedValue };
    setFormData(updatedFormData);

    // If field has been touched, revalidate in real time
    if (touched[name]) {
      const error = validateField(name, sanitizedValue, updatedFormData);
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }

    // If typing in password, revalidate confirmPassword if touched
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validateField('confirmPassword', updatedFormData.confirmPassword, updatedFormData);
      setFormErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }

    if (alert) setAlert(null);
  };

  // Handle onBlur to trigger validation on exit
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name], formData);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Full-form validation before submit
  const validateAll = () => {
    const errors = {};
    const touchedAll = {};

    Object.keys(formData).forEach((field) => {
      touchedAll[field] = true;
      const err = validateField(field, formData[field], formData);
      if (err) errors[field] = err;
    });

    setTouched(touchedAll);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password strength calculator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      setAlert({
        type: 'error',
        message: 'Please resolve the highlighted issues in the registration form.'
      });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });

    setIsSubmitting(false);

    if (result.success) {
      setAlert({
        type: 'success',
        message: 'Account successfully registered! Redirecting to your customer portal...'
      });
      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: ''
      });
      setTouched({});
      setFormErrors({});
      // Redirect to customer dashboard
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 1500);
    } else {
      setAlert({
        type: 'error',
        message: result.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-slate-900 to-slate-900 text-white pt-20 pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Customer Management System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Enterprise Customer Management,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-indigo-300 to-brand-400">
                Simplified & Secure.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              A comprehensive platform featuring self-service customer registration, individual
              profile dashboards, and an executive Super Admin control center with search,
              pagination, and account administration.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#register"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 transition flex items-center gap-2 group"
              >
                <span>Register as Customer</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition"
              >
                Customer Sign In
              </Link>

              <Link
                to="/admin/login"
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-black text-slate-300 border border-slate-700/80 font-medium text-xs transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                Super Admin Access
              </Link>
            </div>

            {/* Platform Feature Badges */}
            <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-slate-400 mt-1">Role-Based Access Control</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Bcrypt</p>
                <p className="text-xs text-slate-400 mt-1">Encrypted Credentials</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">RESTful</p>
                <p className="text-xs text-slate-400 mt-1">Express & MongoDB API</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Real-Time</p>
                <p className="text-xs text-slate-400 mt-1">Admin Search & Pagination</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Key Highlights & Registration Card */}
      <section id="register" className="py-16 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Platform Architecture & Highlights */}
            <div className="lg:col-span-5 space-y-6 pt-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Customer Self-Service</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Customers register with instant credential validation, access their own private
                  profile, securely update contact information, and change passwords anytime.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Super Admin Command Center</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Super administrators monitor total customer metrics, search across full customer
                  records, view profiles, edit details, and toggle active/inactive access states.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">High-Security Standards</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Passwords hashed with bcrypt, strict duplicate email prevention, JWT bearer tokens,
                  and route-level authorization barriers ensure customers cannot view or modify
                  unauthorized data.
                </p>
              </div>

              {/* Quick links to existing account */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-900 to-indigo-950 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Already registered?</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Sign in to your customer portal</p>
                  </div>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-white text-brand-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
                  >
                    Login Now
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Customer Registration Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 relative">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                    Customer Registration
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
                    Create Your Customer Account
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Fill out the fields below. All fields feature strict real-time validation.
                  </p>
                </div>

                {/* Feedback Alert */}
                {alert && (
                  <div className="mb-6">
                    <Alert
                      type={alert.type}
                      message={alert.message}
                      onClose={() => setAlert(null)}
                    />
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="name"
                        className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                      >
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      {touched.name && !formErrors.name && (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Valid Name
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Simran Gupta"
                        maxLength={60}
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                          touched.name && formErrors.name
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : touched.name && !formErrors.name && formData.name
                            ? 'border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                            : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                        }`}
                      />
                      {touched.name && (
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          {formErrors.name ? (
                            <XCircle className="w-4 h-4 text-rose-500" />
                          ) : (
                            formData.name && <Check className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {touched.name && formErrors.name && (
                      <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="email"
                          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                        >
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        {touched.email && !formErrors.email && formData.email && (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Valid Email
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                            touched.email && formErrors.email
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : touched.email && !formErrors.email && formData.email
                              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                              : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                          }`}
                        />
                        {touched.email && (
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                            {formErrors.email ? (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            ) : (
                              formData.email && <Check className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {touched.email && formErrors.email && (
                        <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone Field (STRICT 10 DIGITS) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="phone"
                          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                        >
                          Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <span
                          className={`text-[11px] font-bold ${
                            formData.phone.length === 10
                              ? 'text-emerald-600'
                              : formData.phone.length > 0
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {formData.phone.length}/10 digits
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white font-mono tracking-wider transition ${
                            touched.phone && formErrors.phone
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : touched.phone && !formErrors.phone && formData.phone.length === 10
                              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                              : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                          }`}
                        />
                        {touched.phone && (
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                            {formErrors.phone ? (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            ) : (
                              formData.phone.length === 10 && <Check className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {touched.phone && formErrors.phone ? (
                        <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{formErrors.phone}</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-slate-400">
                          Must be exactly 10 digits (e.g. 9876543210)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="address"
                        className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                      >
                        Physical Address <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {formData.address.length}/300 chars (min 8)
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <textarea
                        id="address"
                        name="address"
                        rows={2}
                        maxLength={300}
                        placeholder="Flat / House No, Street name, City, State, Pincode"
                        value={formData.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                          touched.address && formErrors.address
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : touched.address && !formErrors.address && formData.address
                            ? 'border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                            : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                        }`}
                      />
                    </div>
                    {touched.address && formErrors.address && (
                      <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  {/* Password & Confirm Password Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="password"
                          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                        >
                          Password <span className="text-rose-500">*</span>
                        </label>
                        {formData.password && (
                          <span
                            className={`text-[11px] font-bold ${
                              passwordStrength.score === 1
                                ? 'text-rose-600'
                                : passwordStrength.score === 2
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {passwordStrength.label}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                            touched.password && formErrors.password
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : touched.password && !formErrors.password && formData.password
                              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                              : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password strength progress bar */}
                      {formData.password && (
                        <div className="mt-1.5 flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'
                            }`}
                            style={{ width: '33.3%' }}
                          />
                          <div
                            className={`h-full transition-all ${
                              passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'
                            }`}
                            style={{ width: '33.3%' }}
                          />
                          <div
                            className={`h-full transition-all ${
                              passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'
                            }`}
                            style={{ width: '33.4%' }}
                          />
                        </div>
                      )}

                      {touched.password && formErrors.password && (
                        <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {formErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="confirmPassword"
                          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                        >
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        {formData.confirmPassword && (
                          <span
                            className={`text-[11px] font-bold ${
                              formData.password === formData.confirmPassword
                                ? 'text-emerald-600'
                                : 'text-rose-500'
                            }`}
                          >
                            {formData.password === formData.confirmPassword
                              ? '✓ Match'
                              : '✗ Mismatch'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repeat password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                            touched.confirmPassword && formErrors.confirmPassword
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : touched.confirmPassword && !formErrors.confirmPassword && formData.confirmPassword
                              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                              : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {touched.confirmPassword && formErrors.confirmPassword && (
                        <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submission Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating Customer Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Customer Registration</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-xs text-slate-500 pt-2">
                    By registering, you agree to our terms of service and acknowledge that data is
                    securely stored in accordance with modern encryption standards.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
