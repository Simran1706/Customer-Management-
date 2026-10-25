import React from 'react';
import { Shield, Lock, CheckCircle2, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </span>
              OmniCRM Enterprise
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Modern full-stack customer relationship management and administration platform.
              Engineered with end-to-end encryption, role-based access controls, and robust
              RESTful APIs.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-bit Hash Protection
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> RBAC Enforced
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wider">
              Portals
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/login" className="hover:text-white transition">
                  Customer Portal
                </a>
              </li>
              <li>
                <a href="/admin/login" className="hover:text-white transition">
                  Super Admin Console
                </a>
              </li>
              <li>
                <a href="/#register" className="hover:text-white transition">
                  Customer Registration
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wider">
              Architecture
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>MERN Stack (MongoDB, Express, React, Node)</li>
              <li>JWT Bearer Token Authentication</li>
              <li>Bcrypt Secure Hash Standard</li>
              <li>Tailwind CSS Responsive Design</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} OmniCRM System. Assignment Deliverable. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with precision, reliability, and clean code principles.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
