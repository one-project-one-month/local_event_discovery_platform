import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/admin/Login';
import EventCreate from './pages/admin/EventCreate';
import EventEdit from './pages/admin/EventEdit';
import EventDetails from './pages/admin/EventDetails';
import Users from './pages/admin/Users';
import { Toaster } from './components/ui/sonner';
import RoleBasedRoute from './components/auth/RoleBasedRoute';

function App() {
  return (
    <>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <RoleBasedRoute>
              <Dashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <Users />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/events/create"
          element={
            <RoleBasedRoute>
              <EventCreate />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/events/edit/:id"
          element={
            <RoleBasedRoute>
              <EventEdit />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/events/:id"
          element={
            <RoleBasedRoute>
              <EventDetails />
            </RoleBasedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
