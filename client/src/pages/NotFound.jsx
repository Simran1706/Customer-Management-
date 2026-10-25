import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-extrabold text-brand-600">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Page Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The page you are looking for doesn't exist or has been moved to another URL.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
