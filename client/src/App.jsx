import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';

// Public & User Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Locations } from './pages/Locations';
import { SearchParking } from './pages/SearchParking';
import { BookSlot } from './pages/BookSlot';
import { ReservationConfirmation } from './pages/ReservationConfirmation';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserDashboard } from './pages/UserDashboard';
import { MyBookings } from './pages/MyBookings';
import { BookingDetails } from './pages/BookingDetails';
import { Profile } from './pages/Profile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageLocations } from './pages/admin/ManageLocations';
import { ManageSlots } from './pages/admin/ManageSlots';
import { ManageReservations } from './pages/admin/ManageReservations';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';

// Public Layout Wrapper
const PublicLayout = () => (
  <div className="min-h-screen flex flex-col justify-between">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              {/* Public & User Flow Routes with Navbar + Footer */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/search" element={<SearchParking />} />
                <Route path="/book/:locationId" element={<BookSlot />} />
                <Route path="/confirmation/:id" element={<ReservationConfirmation />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected User Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bookings/:id"
                  element={
                    <ProtectedRoute>
                      <BookingDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Admin Portal with dedicated AdminLayout & Sidebar */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="locations" element={<ManageLocations />} />
                <Route path="slots" element={<ManageSlots />} />
                <Route path="reservations" element={<ManageReservations />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="reports" element={<ReportsAnalytics />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
