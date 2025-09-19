import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleTheme } from '@store/slices/themeSlice';
import type { RootState } from '@store/index';
import { removeAdminToken, getAdminFromToken, getAdminToken } from '@utils/auth';
import { getAdminSocket, closeAdminSocket } from '@services/socket';
import adminService from '@services/adminService';
import LanguageSwitcher from '@components/LanguageSwitcher';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLayout: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Theme state
  const mode = useAppSelector((s: RootState) => s.theme.mode);
  const dispatch = useAppDispatch();

  const token = getAdminToken();
  const adminData = token ? getAdminFromToken(token) : null;

  // Sync theme to <html> class and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', mode);
  }, [mode]);

  // Sync language from backend preference (cookie 'lang' is also set server-side)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminService.getLanguage();
        const serverLang = (res?.language || 'vi').split('-')[0];
        const currentLang = (i18n.language || 'vi').split('-')[0];
        if (!cancelled && serverLang && serverLang !== currentLang) {
          await i18n.changeLanguage(serverLang);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [i18n]);

  const handleLogout = () => {
    removeAdminToken();
    try { closeAdminSocket(); } catch {}
    navigate('/login');
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: t('navigation.dashboard'),
      icon: '📊',
      path: '/dashboard',
    },
    {
      id: 'users',
      label: t('navigation.users'),
      icon: '👥',
      path: '/users',
      submenu: [
        { id: 'users-list', label: t('navigation.usersList'), path: '/users' },
        { id: 'users-activity', label: t('navigation.usersActivity'), path: '/users/activity' },
      ],
    },
    {
      id: 'notes',
      label: t('navigation.notes'),
      icon: '📝',
      path: '/notes',
      submenu: [
        { id: 'notes-list', label: t('navigation.notesList'), path: '/notes' },
        { id: 'notes-create', label: t('navigation.notesCreate'), path: '/notes/create' },
      ],
    },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Maintain admin socket connection based on token
  useEffect(() => {
    if (token) {
      const s = getAdminSocket();
      // Example: log admin-targeted events to verify connectivity
      const onConnected = () => {
        // eslint-disable-next-line no-console
        console.log('[AdminLayout] Socket connected for admin');
      };
      const onLanguageUpdated = (p: any) => {
        try {
          const next = (p?.language || '').split('-')[0];
          if (next) {
            i18n.changeLanguage(next);
          }
        } catch {}
      };
      s.on('connected', onConnected);
      s.on('language_updated', onLanguageUpdated);

      return () => {
        try {
          s.off('connected', onConnected);
          s.off('language_updated', onLanguageUpdated);
        } catch {}
      };
    } else {
      try { closeAdminSocket(); } catch {}
    }
  }, [token, i18n]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex">
      {/* Sidebar */}
      <div className={`bg-white dark:bg-neutral-900 shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('layout.adminPanel')}</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
            >
              {sidebarOpen ? '📋' : '📋'}
            </button>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full ${
                    sidebarOpen
                      ? 'flex items-center px-3 py-2 rounded-lg'
                      : 'flex items-center justify-center py-3'
                  } text-left transition-colors ${
                    isActiveRoute(item.path)
                      ? sidebarOpen
                        ? 'bg-blue-100 dark:bg-neutral-800 text-blue-700 dark:text-white border border-blue-200 dark:border-neutral-600 font-bold'
                        : 'text-blue-700 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {sidebarOpen ? (
                    <>
                      <span className="text-xl mr-3">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </>
                  ) : (
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isActiveRoute(item.path)
                          ? 'ring-1 ring-blue-400 bg-blue-50 dark:bg-neutral-800 text-blue-700 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {item.icon}
                    </span>
                  )}
                </button>

                {/* Submenu */}
                {item.submenu && sidebarOpen && isActiveRoute(item.path) && (
                  <ul className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <li key={subItem.id}>
                        <button
                          onClick={() => navigate(subItem.path)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            location.pathname === subItem.path
                              ? 'bg-blue-50 dark:bg-neutral-700 text-blue-600 dark:text-white font-bold'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                          }`}
                        >
                          {subItem.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-neutral-900 shadow-sm border-b border-gray-200 dark:border-neutral-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              {menuItems.find(item => isActiveRoute(item.path))?.label || t('navigation.dashboard')}
            </h2>

            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* Theme Toggle Button */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                title={mode === 'dark' ? t('layout.switchToLight') : t('layout.switchToDark')}
              >
                {mode === 'dark' ? '☀️' : '🌙'}
              </button>
              
              {adminData && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{adminData.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('layout.admin')}</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {adminData.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                {t('layout.logout')}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-neutral-950">
          <Outlet />
        </main>
      </div>

      {/* Toasts */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme={mode === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
};

export default AdminLayout;
