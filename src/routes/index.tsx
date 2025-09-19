import { createBrowserRouter } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import AdminLayout from '@layouts/AdminLayout'
import ProtectedRoute from '@components/ProtectedRoute'
import Login from '@/pages/Login/Login'
import Dashboard from '@/pages/Dashboard/Dashboard'
import UsersList from '@pages/Users/UsersList'
import UserActivity from '@pages/Users/UserActivity'
import NotesList from '@pages/Notes/NotesList'
import CreateNote from '@pages/Notes/CreateNote'

const router = createBrowserRouter([
  // Public
  { path: '/login', element: <Login /> },

  // Protected
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },

      // Users
      { path: 'users', element: <UsersList /> },
      { path: 'users/activity', element: <UserActivity /> },
      { path: 'users/:userId/activity', element: <UserActivity /> },

      // Notes
      { path: 'notes', element: <NotesList /> },
      { path: 'notes/create', element: <CreateNote /> },
    ],
  },

  // Catch all
  { path: '*', element: <Navigate to="/login" replace /> },
])

export default router
