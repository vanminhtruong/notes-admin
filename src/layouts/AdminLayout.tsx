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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex xl-down:flex-col">
      {/* Sidebar - Desktop: Fixed width, Mobile: Full width overlay */}
      <div className={`bg-white dark:bg-neutral-900 shadow-lg transition-all duration-300 overflow-hidden
        xl-down:fixed xl-down:inset-y-0 xl-down:left-0 xl-down:z-50 xl-down:max-w-sm xl-down:overflow-hidden
        lg-down:${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarOpen ? 'w-64 xl-down:w-80 pointer-events-auto' : 'w-16 xl-down:w-0 xl-down:pointer-events-none'}
      `} style={{ zIndex: sidebarOpen ? 9999 : 50 }}>
        <div className="p-4 xl-down:p-3 sm-down:p-2 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl xl-down:text-lg sm-down:text-base font-bold text-gray-800 dark:text-gray-200 truncate">
                {t('layout.adminPanel')}
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 sm-down:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex-shrink-0"
            >
              <span className="text-lg sm-down:text-base">{sidebarOpen ? '📋' : '📋'}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <nav className="p-4 xl-down:p-3 sm-down:p-2">
            <ul className="space-y-2 sm-down:space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      // Auto-close sidebar on mobile after navigation
                      if (window.innerWidth <= 1279) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full transition-colors ${
                      sidebarOpen
                        ? 'flex items-center px-3 py-2 xl-down:px-2 sm-down:px-2 sm-down:py-1.5 rounded-lg'
                        : 'xl:flex hidden items-center justify-center py-3 xl-down:py-2'
                    } text-left ${
                      isActiveRoute(item.path)
                        ? sidebarOpen
                          ? 'bg-blue-100 dark:bg-neutral-800 text-blue-700 dark:text-white border border-blue-200 dark:border-neutral-600 font-bold'
                          : 'text-blue-700 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {sidebarOpen ? (
                      <>
                        <span className="text-xl xl-down:text-lg sm-down:text-base mr-3 xl-down:mr-2 flex-shrink-0">{item.icon}</span>
                        <span className="font-medium xl-down:text-sm sm-down:text-xs truncate">{item.label}</span>
                      </>
                    ) : (
                      <span
                        className={`xl:flex hidden h-10 w-10 xl-down:h-8 xl-down:w-8 sm-down:h-7 sm-down:w-7 items-center justify-center rounded-lg ${
                          isActiveRoute(item.path)
                            ? 'ring-1 ring-blue-400 bg-blue-50 dark:bg-neutral-800 text-blue-700 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span className="xl-down:text-sm sm-down:text-xs">{item.icon}</span>
                      </span>
                    )}
                  </button>

                  {/* Submenu */}
                  {item.submenu && sidebarOpen && isActiveRoute(item.path) && (
                    <ul className="ml-8 xl-down:ml-6 sm-down:ml-4 mt-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.id}>
                          <button
                            onClick={() => {
                              navigate(subItem.path);
                              // Auto-close sidebar on mobile after navigation
                              if (window.innerWidth <= 1279) {
                                setSidebarOpen(false);
                              }
                            }}
                            className={`w-full text-left px-3 py-2 xl-down:px-2 sm-down:px-1.5 sm-down:py-1 rounded-lg text-sm xl-down:text-xs sm-down:text-xs transition-colors ${
                              location.pathname === subItem.path
                                ? 'bg-blue-50 dark:bg-neutral-700 text-blue-600 dark:text-white font-bold'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                            }`}
                          >
                            <span className="truncate">{subItem.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User Controls - Only show in sidebar on mobile when sidebar is open */}
          {sidebarOpen && (
            <div className="hidden xl-down:block mt-auto p-4 xl-down:p-3 sm-down:p-2 border-t border-gray-200 dark:border-neutral-700">
              <div className="space-y-3 xl-down:space-y-2">
                {/* User Info */}
                {adminData && (
                  <div className="flex items-center space-x-3 xl-down:space-x-2 p-3 xl-down:p-2 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <div className="w-8 h-8 xl-down:w-7 xl-down:h-7 sm-down:w-6 sm-down:h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm xl-down:text-xs sm-down:text-2xs font-medium">
                        {adminData.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm xl-down:text-xs sm-down:text-2xs font-medium text-gray-700 dark:text-gray-300 truncate">{adminData.email}</p>
                      <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">{t('layout.admin')}</p>
                    </div>
                  </div>
                )}

                {/* Language Switcher */}
                <div className="flex items-center justify-between">
                  <span className="text-sm xl-down:text-xs sm-down:text-2xs font-medium text-gray-700 dark:text-gray-300">{t('layout.language')}</span>
                  <LanguageSwitcher />
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm xl-down:text-xs sm-down:text-2xs font-medium text-gray-700 dark:text-gray-300">{t('layout.theme')}</span>
                  <button
                    onClick={() => dispatch(toggleTheme())}
                    className="p-2 xl-down:p-1.5 sm-down:p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center space-x-2"
                    title={mode === 'dark' ? t('layout.switchToLight') : t('layout.switchToDark')}
                  >
                    <span className="text-base xl-down:text-sm sm-down:text-xs">{mode === 'dark' ? '☀️' : '🌙'}</span>
                    <span className="text-xs xl-down:text-2xs text-gray-600 dark:text-gray-400">
                      {mode === 'dark' ? t('layout.lightMode') : t('layout.darkMode')}
                    </span>
                  </button>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 xl-down:py-2 sm-down:py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm xl-down:text-xs font-medium"
                >
                  <span>🚪</span>
                  <span>{t('layout.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Main Content */}
      <div className="flex-1 flex flex-col xl-down:w-full">
        {/* Mobile Header - Show hamburger menu */}
        <div className="xl-down:flex xl-down:items-center xl-down:justify-between xl-down:p-4 xl-down:bg-white xl-down:dark:bg-neutral-900 xl-down:border-b xl-down:border-gray-200 xl-down:dark:border-neutral-700 hidden lg-down:flex xl-down:relative xl-down:z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors xl-down:relative xl-down:z-50"
          >
            <span className="text-xl">☰</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
            {menuItems.find(item => isActiveRoute(item.path))?.label || t('navigation.dashboard')}
          </h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Desktop Header */}
        <header className="bg-white dark:bg-neutral-900 shadow-sm border-b border-gray-200 dark:border-neutral-700 px-6 xl-down:px-4 sm-down:px-3 py-4 xl-down:py-3 sm-down:py-2 lg-down:hidden xl-down:relative xl-down:z-50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl xl-down:text-xl sm-down:text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
              {menuItems.find(item => isActiveRoute(item.path))?.label || t('navigation.dashboard')}
            </h2>

            <div className="flex items-center space-x-4 xl-down:space-x-3 sm-down:space-x-2">
              {/* Language Switcher - Hide on mobile, shown in sidebar instead */}
              <div className="xl:block hidden">
                <LanguageSwitcher />
              </div>
              
              {/* Theme Toggle Button - Hide on mobile, shown in sidebar instead */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="xl:block hidden p-2 xl-down:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex-shrink-0"
                title={mode === 'dark' ? t('layout.switchToLight') : t('layout.switchToDark')}
              >
                <span className="xl-down:text-sm">{mode === 'dark' ? '☀️' : '🌙'}</span>
              </button>
              
              {/* User Info - Hide on mobile, shown in sidebar instead */}
              {adminData && (
                <div className="xl:flex hidden items-center space-x-3 xl-down:space-x-2">
                  <div className="text-right xl-down:hidden">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-32">{adminData.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('layout.admin')}</p>
                  </div>
                  <div className="w-8 h-8 xl-down:w-6 xl-down:h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm xl-down:text-xs font-medium">
                      {adminData.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {/* Logout Button - Hide on mobile, shown in sidebar instead */}
              <button
                onClick={handleLogout}
                className="xl:block hidden px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm xl-down:text-xs font-medium flex-shrink-0"
              >
                {t('layout.logout')}
              </button>
            </div>
          </div>
        </header>


        {/* Content */}
        <main className="flex-1 p-6 xl-down:p-4 md-down:p-3 sm-down:p-2 xs-down:p-1 overflow-auto bg-gray-50 dark:bg-neutral-950">
          <Outlet />
        </main>
        
        {/* Overlay for mobile sidebar - inside main content */}
        {sidebarOpen && (
          <div 
            className="xl-down:fixed xl-down:inset-0 xl-down:bg-black xl-down:bg-opacity-50 xl-down:z-40 hidden lg-down:block"
            onClick={() => setSidebarOpen(false)}
          />
        )}
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
