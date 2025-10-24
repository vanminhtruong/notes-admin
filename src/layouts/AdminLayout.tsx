import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleTheme } from '@store/slices/themeSlice';
import type { RootState } from '@store/index';
import { removeAdminToken, getAdminToken, hasPermission, isSuperAdmin, getCurrentAdminInfo, getVisibleUserActivityTabs, setAdminPermissionOverride } from '@utils/auth';
import { getAdminSocket, closeAdminSocket } from '@services/socket';
import adminService from '@services/adminService';
import LanguageSwitcher from '@components/LanguageSwitcher';
import ImagePreviewModal from '@components/ImagePreviewModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLayout: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  // Mặc định: Desktop (>=1280px) mở, Mobile (<1280px) đóng
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth > 1279 : true));
  const navigate = useNavigate();
  const location = useLocation();
  // Trạng thái mở/đóng cho menu cha có submenu
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  
  // Theme state
  const mode = useAppSelector((s: RootState) => s.theme.mode);
  const dispatch = useAppDispatch();

  // User dropdown state (desktop header)
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Admin profile state for real-time updates
  const [currentAdminProfile, setCurrentAdminProfile] = useState(getCurrentAdminInfo());
  const [profileLoading, setProfileLoading] = useState<boolean>(true);

  // Image preview modal state
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState<string | null>(null);

  const token = getAdminToken();

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
        const res: any = await adminService.getLanguage();
        const serverLang = (res?.language || 'vi').split('-')[0];
        const currentLang = (i18n.language || 'vi').split('-')[0];
        if (!cancelled && serverLang && serverLang !== currentLang) {
          await i18n.changeLanguage(serverLang);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [i18n]);

  // Fetch admin profile on mount/when token changes to persist avatar after reload
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      try {
        const res: any = await adminService.getMyProfile();
        if (!cancelled && res?.admin) {
          setCurrentAdminProfile(res.admin);
        }
      } catch (e) {
        // no-op: keep fallback from token
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const handleLogout = () => {
    removeAdminToken();
    try { closeAdminSocket(); } catch {}
    navigate('/login');
  };

  const confirmLogout = () => {
    toast.warn(
      <div className="flex flex-col items-center p-2">
        <div className="mb-3 flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('layout.logoutConfirm.title', { defaultValue: 'Xác nhận đăng xuất' })}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('layout.logoutConfirm.message', { defaultValue: 'Bạn có chắc muốn đăng xuất không?' })}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => toast.dismiss()}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            {t('actions.cancel', { defaultValue: 'Hủy' })}
          </button>
          <button
            onClick={() => {
              toast.dismiss();
              handleLogout();
            }}
            className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors font-medium text-sm"
          >
            {t('layout.logout')}
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        className: 'custom-confirm-toast',
      }
    );
  };

  // Close user menu on outside click or ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const currentAdmin = currentAdminProfile || getCurrentAdminInfo();
  const isSuper = isSuperAdmin();

  // Helper function to handle avatar click
  const handleAvatarClick = (avatarSrc?: string) => {
    if (avatarSrc) {
      setImagePreviewSrc(avatarSrc);
      setImagePreviewOpen(true);
    }
  };

  // Helper function to render admin avatar
  const renderAdminAvatar = (size: string = "w-8 h-8", clickable: boolean = false) => {
    // Trong khi đang tải profile, hiển thị skeleton để tránh flash avatar mặc định
    if (profileLoading) {
      return (
        <div className={`${size} rounded-full bg-gray-200 dark:bg-neutral-800 animate-pulse flex-shrink-0`} />
      );
    }
    const avatar = (currentAdmin as any)?.avatar;
    if (avatar) {
      const imageElement = (
        <img 
          src={avatar} 
          alt="Avatar" 
          className={`${size} rounded-full object-cover flex-shrink-0 ${clickable ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all' : ''}`}
          onError={(e) => {
            console.error('Failed to load admin avatar:', avatar);
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement!;
            parent.innerHTML = `<div class="${size} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white text-sm font-medium">${currentAdmin?.email.charAt(0).toUpperCase()}</span>
            </div>`;
          }}
        />
      );
      
      if (clickable) {
        return (
          <div onClick={() => handleAvatarClick(avatar)}>
            {imageElement}
          </div>
        );
      }
      return imageElement;
    }
    return (
      <div className={`${size} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-sm font-medium">
          {currentAdmin?.email.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  // Check if user has access to any User Activity tabs
  const hasUserActivityAccess = isSuper || getVisibleUserActivityTabs().length > 0;

  const menuItems = [
    {
      id: 'dashboard',
      label: t('navigation.dashboard'),
      icon: '📊',
      path: '/dashboard',
      permission: 'view_analytics',
    },
    {
      id: 'users',
      label: t('navigation.users'),
      icon: '👥',
      path: '/users',
      permission: 'manage_users',
      submenu: [
        { id: 'users-list', label: t('navigation.usersList'), path: '/users' },
        ...(hasUserActivityAccess ? [
          { id: 'users-activity', label: t('navigation.usersActivity'), path: '/users/activity' }
        ] : []),
        ...(hasPermission('manage_users.chat_settings.view') ? [
          { id: 'chat-settings', label: t('navigation.chatSettings', { defaultValue: 'Chat Settings' }), path: '/users/chat-settings' }
        ] : []),
      ],
    },
    {
      id: 'notes',
      label: t('navigation.notes'),
      icon: '📝',
      path: '/notes',
      permission: 'manage_notes',
      submenu: [
        { id: 'notes-list', label: t('navigation.notesList'), path: '/notes' },
        ...(hasPermission('manage_notes.categories.view') ? [
          { id: 'categories', label: t('navigation.categories', { defaultValue: 'Categories' }), path: '/categories' }
        ] : []),
      ],
    },
    ...(isSuper ? [{
      id: 'admins',
      label: t('navigation.admins'),
      icon: '👨‍💼',
      path: '/admins',
      permission: 'manage_admins',
    }] : []),
  ].filter(item => !item.permission || hasPermission(item.permission));

  // Redirect to no-permission page if admin has no permissions at all
  useEffect(() => {
    if (!isSuper && menuItems.length === 0 && location.pathname !== '/no-permission' && location.pathname !== '/profile') {
      navigate('/no-permission');
    }
  }, [isSuper, menuItems.length, location.pathname, navigate]);

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Khởi tạo/đồng bộ openMenus theo route hiện tại để tự động mở menu cha đang active
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of menuItems) {
      if ((item as any).submenu) {
        // Mở menu cha nếu chính nó active hoặc bất kỳ submenu nào active
        const hasActiveChild = (item as any).submenu?.some((sub: any) => {
          const sp = sub.path as string;
          return location.pathname === sp || location.pathname.startsWith(sp + '/');
        });
        next[item.id] = isActiveRoute(item.path) || !!hasActiveChild;
      }
    }
    setOpenMenus((prev) => ({ ...prev, ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
      const onProfileUpdated = (p: any) => {
        try {
          if (p?.admin) {
            setCurrentAdminProfile(p.admin);
            console.log('Admin profile updated in layout:', p.admin.avatar);
          }
        } catch {}
      };
      s.on('connected', onConnected);
      s.on('language_updated', onLanguageUpdated);
      const onPermissionsChanged = (p: any) => {
        try {
          setAdminPermissionOverride({ permissions: p?.permissions || [], adminLevel: p?.adminLevel });
          // Force re-render by updating local state
          setCurrentAdminProfile(prev => prev ? { ...prev, adminPermissions: p?.permissions || prev.adminPermissions, adminLevel: p?.adminLevel || prev.adminLevel } : prev);
          console.log('[AdminLayout] Permissions changed:', p);
        } catch {}
      };
      s.on('permissions_changed', onPermissionsChanged);
      s.on('admin_profile_updated', onProfileUpdated);

      return () => {
        try {
          s.off('connected', onConnected);
          s.off('language_updated', onLanguageUpdated);
          s.off('admin_profile_updated', onProfileUpdated);
          s.off('permissions_changed', onPermissionsChanged);
        } catch {}
      };
    } else {
      try { closeAdminSocket(); } catch {}
    }
  }, [token, i18n]);

  return (
    <div className="min-h-screen flex xl-down:flex-col">
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
                      if (item.submenu && sidebarOpen) {
                        // Toggle accordion cho menu có submenu khi sidebar đang mở
                        setOpenMenus((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                      } else {
                        // Điều hướng bình thường cho menu không có submenu hoặc khi sidebar đóng (icon-only)
                        navigate(item.path);
                        if (window.innerWidth <= 1279) {
                          setSidebarOpen(false);
                        }
                      }
                    }}
                    className={`w-full transition-colors ${
                      sidebarOpen
                        ? 'flex items-center justify-between px-3 py-2 xl-down:px-2 sm-down:px-2 sm-down:py-1.5 rounded-lg'
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
                        <div className="flex items-center min-w-0">
                          <span className="text-xl xl-down:text-lg sm-down:text-base mr-3 xl-down:mr-2 flex-shrink-0">{item.icon}</span>
                          <span className="font-medium xl-down:text-sm sm-down:text-xs truncate">{item.label}</span>
                        </div>
                        {item.submenu && (
                          <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${openMenus[item.id] ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01-.02-1.06L10.94 10 7.19 6.29a.75.75 0 111.06-1.06l4.24 4.24a.75.75 0 010 1.06l-4.24 4.24a.75.75 0 01-1.04 0z" clipRule="evenodd" />
                          </svg>
                        )}
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
                  {item.submenu && sidebarOpen && openMenus[item.id] && (
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
                {currentAdmin && (
                  <button
                    onClick={() => { 
                      navigate('/profile'); 
                      if (window.innerWidth <= 1279) {
                        setSidebarOpen(false);
                      }
                    }}
                    className="w-full flex items-center space-x-3 xl-down:space-x-2 p-3 xl-down:p-2 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
                  >
                    {renderAdminAvatar("w-8 h-8 xl-down:w-7 xl-down:h-7 sm-down:w-6 sm-down:h-6", true)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm xl-down:text-xs sm-down:text-2xs font-medium text-gray-700 dark:text-gray-300 truncate">{currentAdmin.email}</p>
                        {currentAdmin.adminLevel === 'super_admin' && (
                          <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">Super</span>
                        )}
                      </div>
                      <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">
                        {currentAdmin.adminLevel === 'super_admin' ? 'Super Admin' : 'Phó Admin'}
                      </p>
                    </div>
                    <svg className="w-4 h-4 xl-down:w-3 xl-down:h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6 0 .55.45 1 1 1h10c.55 0 1-.45 1-1 0-3.31-2.69-6-6-6z" />
                    </svg>
                  </button>
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
                  onClick={confirmLogout}
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
              
              {/* User Dropdown (desktop) */}
              {currentAdmin && (
                <div className="relative xl:flex hidden" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                  >
                    {renderAdminAvatar("w-8 h-8 xl-down:w-6 xl-down:h-6", true)}
                    <div className="hidden lg:block">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-40 truncate block">
                        {currentAdmin.email}
                      </span>
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">
                        {currentAdmin.adminLevel === 'super_admin' ? 'Super Admin' : 
                         currentAdmin.adminLevel === 'sub_admin' ? 'Phó Admin' :
                         currentAdmin.adminLevel === 'dev' ? 'Dev' :
                         currentAdmin.adminLevel === 'mod' ? 'Mod' : 'Admin'}
                      </span>
                    </div>
                    <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-900 rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-[10000] origin-top-right">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{currentAdmin.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {currentAdmin.adminLevel === 'super_admin' ? 'Super Admin' : 
                           currentAdmin.adminLevel === 'sub_admin' ? 'Phó Admin' :
                           currentAdmin.adminLevel === 'dev' ? 'Dev' :
                           currentAdmin.adminLevel === 'mod' ? 'Mod' : 'Admin'}
                        </p>
                      </div>
                      <button
                        onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6 0 .55.45 1 1 1h10c.55 0 1-.45 1-1 0-3.31-2.69-6-6-6z" />
                        </svg>
                        <span>{t('profile:edit', { defaultValue: 'Sửa thông tin' })}</span>
                      </button>
                      <button
                        onClick={confirmLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M7.5 3.75A2.25 2.25 0 009.75 6v3h4.5a.75.75 0 010 1.5h-4.5v3a2.25 2.25 0 01-2.25 2.25H6a.75.75 0 010-1.5h1.5a.75.75 0 00.75-.75V10.5H6a.75.75 0 010-1.5h2.25V6A.75.75 0 007.5 5.25H6a.75.75 0 010-1.5h1.5z" clipRule="evenodd" />
                        </svg>
                        <span>{t('layout.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>


        {/* Content */}
        <main className="flex-1 p-6 xl-down:p-4 md-down:p-3 sm-down:p-2 xs-down:p-1 overflow-auto">
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

      {/* Image Preview Modal */}
      <ImagePreviewModal
        open={imagePreviewOpen}
        src={imagePreviewSrc}
        alt="Admin Avatar"
        onClose={() => {
          setImagePreviewOpen(false);
          setImagePreviewSrc(null);
        }}
      />

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
        style={{ zIndex: 999999 }}
      />
    </div>
  );
};

export default AdminLayout;
