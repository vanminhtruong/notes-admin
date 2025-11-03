import { createBrowserRouter } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import AdminLayout from '@layouts/AdminLayout'
import ProtectedRoute from '@/middlewares/ProtectedRoute'
import PermissionRoute from '@/middlewares/PermissionRoute'
import UserActivityRoute from '@components/UserActivityRoute'
import Login from '@/pages/Login/Login'
import Dashboard from '@/pages/Dashboard/Dashboard'
import UsersList from '@pages/Users/UsersList'
import UserActivity from '@pages/Users/UserActivity'
import ChatSettings from '@pages/Users/ChatSettings/ChatSettings'
import NotesList from '@pages/Notes/NotesList'
import CategoriesList from '@pages/Categories/CategoriesList'
import BackgroundsList from '@pages/Backgrounds/BackgroundsList'
import AdminsList from '@pages/Admins/AdminsList'
import AdminProfile from '@pages/Profile/AdminProfile'
import NoPermission from '@pages/NoPermission/NoPermission'

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
      
      // No Permission fallback page (không cần permission check)
      { path: 'no-permission', element: <NoPermission /> },
      
      { 
        path: 'dashboard', 
        element: (
          <PermissionRoute permission="view_analytics" redirectTo="/no-permission">
            <Dashboard />
          </PermissionRoute>
        )
      },

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
      { 
        path: 'users/chat-settings', 
        element: (
          <PermissionRoute permission="manage_users.chat_settings.view" redirectTo="/dashboard">
            <ChatSettings />
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

      // Categories
      { 
        path: 'categories', 
        element: (
          <PermissionRoute permission="manage_notes.categories.view" redirectTo="/dashboard">
            <CategoriesList />
          </PermissionRoute>
        )
      },

      // Backgrounds
      { 
        path: 'backgrounds', 
        element: (
          <PermissionRoute permission="manage_notes.backgrounds.view" redirectTo="/dashboard">
            <BackgroundsList />
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
