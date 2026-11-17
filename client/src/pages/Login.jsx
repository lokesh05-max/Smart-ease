import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Car, Lock, Mail, ArrowRight, Loader2, ShieldCheck, UserCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password);
      addToast(`Welcome back, ${res.user.name}!`, 'success');
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoUser = () => {
    setEmail('user@smartparking.com');
    setPassword('User@123');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@smartparking.com');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="bg-white p-8 rounded-3xl border border-cloud-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zeus-900 text-shadow-300 flex items-center justify-center mx-auto shadow-lg border border-kabul-600">
              <Car className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-zeus-900 tracking-tight">
              Sign In to ParkEase
            </h1>
            <p className="text-xs text-kabul-500">
              Access your reservations, parking slots, and profile
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zeus-800">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-kabul-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 text-zeus-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zeus-800">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-kabul-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 text-zeus-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-shadow-500 hover:bg-shadow-600 transition-colors shadow-md shadow-zeus-950/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill helper for college presentation */}
          <div className="pt-4 border-t border-cloud-100 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-kabul-400 block text-center">
              College Demo One-Click Fill
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoUser}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold text-zeus-900 bg-cloud-100 hover:bg-cloud-200 border border-cloud-300 rounded-xl transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-shadow-500" />
                Demo User
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold text-shadow-700 bg-shadow-100 hover:bg-shadow-200 border border-shadow-300 rounded-xl transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-shadow-500" />
                Demo Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-kabul-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-shadow-600 hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
