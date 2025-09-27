import { createBrowserRouter } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import AdminLayout from '@layouts/AdminLayout'
import ProtectedRoute from '@components/ProtectedRoute'
import PermissionRoute from '@components/PermissionRoute'
import UserActivityRoute from '@components/UserActivityRoute'
import Login from '@/pages/Login/Login'
import Dashboard from '@/pages/Dashboard/Dashboard'
import UsersList from '@pages/Users/UsersList'
import UserActivity from '@pages/Users/UserActivity'
import NotesList from '@pages/Notes/NotesList'
import CreateNote from '@pages/Notes/CreateNote'
import SharedNotesList from '@pages/Notes/components/SharedNotesList'
import AdminsList from '@pages/Admins/AdminsList'
import AdminProfile from '@pages/Profile/AdminProfile'

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
      { 
        path: 'users', 
        element: (
          <PermissionRoute permission="manage_users" redirectTo="/dashboard">
            <UsersList />
          </PermissionRoute>
        )
      },

      // Profile (Admin self)
      { path: 'profile', element: <AdminProfile /> },
      { 
        path: 'users/activity', 
        element: (
          <PermissionRoute permission="manage_users" redirectTo="/dashboard">
            <UserActivityRoute redirectTo="/users">
              <UserActivity />
            </UserActivityRoute>
          </PermissionRoute>
        )
      },
      { 
        path: 'users/:userId/activity', 
        element: (
          <PermissionRoute permission="manage_users" redirectTo="/dashboard">
            <UserActivityRoute redirectTo="/users">
              <UserActivity />
            </UserActivityRoute>
          </PermissionRoute>
        )
      },

      // Notes
      { 
        path: 'notes', 
        element: (
          <PermissionRoute permission="manage_notes" redirectTo="/dashboard">
            <NotesList />
          </PermissionRoute>
        )
      },
      { 
        path: 'notes/create', 
        element: (
          <PermissionRoute permission="manage_notes.create" redirectTo="/notes">
            <CreateNote />
          </PermissionRoute>
        )
      },
      { 
        path: 'notes/shared', 
        element: (
          <PermissionRoute permission="manage_notes.shared" redirectTo="/notes">
            <SharedNotesList />
          </PermissionRoute>
        )
      },

      // Admins (Super Admin Only)
      { 
        path: 'admins', 
        element: (
          <PermissionRoute permission="manage_admins" redirectTo="/dashboard">
            <AdminsList />
          </PermissionRoute>
        )
      },
    ],
  },

  // Catch all
  { path: '*', element: <Navigate to="/login" replace /> },
])

export default router
