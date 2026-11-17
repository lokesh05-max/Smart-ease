import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Car, Lock, Mail, User, Phone, ArrowRight, Loader2 } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      addToast('Please fill in all required registration fields', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register(formData);
      addToast('Registration successful! Welcome to ParkEase.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-cloud-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zeus-900 text-shadow-300 flex items-center justify-center mx-auto shadow-lg border border-kabul-600">
              <Car className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-zeus-900 tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs text-kabul-500">
              Join ParkEase to reserve real-time smart parking spots
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zeus-800">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-kabul-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 text-zeus-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zeus-800">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-kabul-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-cloud-50 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-shadow-400/20 focus:border-shadow-500 text-zeus-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zeus-800">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-kabul-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
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
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-kabul-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-shadow-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
