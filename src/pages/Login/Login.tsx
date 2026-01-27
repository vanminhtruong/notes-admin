import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleTheme } from '@store/slices/themeSlice';
import type { RootState } from '@store/index';
import adminService from '@services/adminService';
import { setAdminToken, validateAdminToken, isAdminAuthenticated, removeAdminToken } from '@utils/auth';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { t } = useTranslation('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Theme state
  const mode = useAppSelector((s: RootState) => s.theme.mode);
  const dispatch = useAppDispatch();

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

  useEffect(() => {
    // Nếu bị ép đăng xuất (forced=1), đảm bảo xóa token và KHÔNG tự điều hướng về dashboard
    const params = new URLSearchParams(location.search);
    const isForced = params.get('forced') === '1';
    if (isForced) {
      removeAdminToken();
      return; // Ở lại trang login
    }

    // Xóa token không hợp lệ và kiểm tra authentication bình thường
    if (isAdminAuthenticated()) {
      navigate('/dashboard', { replace: true });
    } else {
      removeAdminToken(); // Xóa token không hợp lệ nếu có
    }
  }, [navigate, location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminService.login(email, password);
      
      // Validate token và kiểm tra quyền admin
      const adminData = validateAdminToken(response.token);
      if (!adminData || (adminData.role !== 'admin' && !adminData.adminLevel)) {
        setError(t('errors.NOT_ADMIN'));
        return;
      }

      // Lưu token và chuyển hướng
      setAdminToken(response.token);
      navigate('/dashboard');
    } catch (error: any) {
      // Xử lý error code từ backend
      const errorCode = error?.code;
      if (errorCode) {
        // Dịch error message theo code
        setError(t(`errors.${errorCode}`));
      } else {
        // Fallback về message gốc hoặc lỗi chung
        setError(error?.message || t('errors.LOGIN_FAILED'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4 xl-down:p-3 sm-down:p-2 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-md xl-down:max-w-sm sm-down:max-w-xs w-full relative z-10">
        {/* Theme Toggle Button */}
        <div className="flex justify-end mb-4 xl-down:mb-3 sm-down:mb-2">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="group p-3 xl-down:p-2.5 sm-down:p-2 rounded-xl xl-down:rounded-lg bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 backdrop-blur-md border border-white/10"
            title={mode === 'dark' ? t('toggleLight') : t('toggleDark')}
          >
            <span className="text-xl xl-down:text-lg sm-down:text-base transition-transform duration-300 group-hover:scale-110 inline-block">{mode === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </div>
        
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-3xl xl-down:rounded-2xl shadow-2xl shadow-black/20 p-8 xl-down:p-6 sm-down:p-5 border border-white/20 dark:border-neutral-800">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6 xl-down:mb-5 sm-down:mb-4">
            <div className="w-20 h-20 xl-down:w-16 xl-down:h-16 sm-down:w-14 sm-down:h-14 rounded-2xl xl-down:rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-10 h-10 xl-down:w-8 xl-down:h-8 sm-down:w-7 sm-down:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          
          <div className="text-center mb-8 xl-down:mb-6 sm-down:mb-4">
            <h1 className="text-3xl xl-down:text-2xl md-down:text-xl sm-down:text-lg font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent mb-2 xl-down:mb-1">{t('title', { defaultValue: 'Admin Panel' })}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-base xl-down:text-sm sm-down:text-xs">{t('subtitle', { defaultValue: 'Sign in to admin panel' })}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 xl-down:space-y-4 sm-down:space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 xl-down:mb-1.5 uppercase tracking-wide">
                {t('email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 xl-down:w-4 xl-down:h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 xl-down:pl-10 xl-down:py-3 sm-down:pl-9 sm-down:py-2.5 border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-xl xl-down:rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-base xl-down:text-sm sm-down:text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 xl-down:mb-1.5 uppercase tracking-wide">
                {t('password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 xl-down:w-4 xl-down:h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 xl-down:pl-10 xl-down:py-3 sm-down:pl-9 sm-down:py-2.5 border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-xl xl-down:rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-base xl-down:text-sm sm-down:text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 px-4 py-3 xl-down:px-3 xl-down:py-2.5 sm-down:px-3 sm-down:py-2 rounded-xl xl-down:rounded-lg text-sm xl-down:text-xs">
                <svg className="w-5 h-5 xl-down:w-4 xl-down:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white py-4 px-4 xl-down:py-3.5 xl-down:px-3 sm-down:py-3 sm-down:px-2 rounded-xl xl-down:rounded-lg font-semibold text-base xl-down:text-sm sm-down:text-xs shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="relative w-5 h-5 xl-down:w-4 xl-down:h-4 sm-down:w-3.5 sm-down:h-3.5 mr-2.5 xl-down:mr-2">
                    <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
                  </div>
                  {t('loading', { defaultValue: 'Đang đăng nhập...' })}
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t('loginButton', { defaultValue: 'Đăng nhập' })}
                  <svg className="w-5 h-5 xl-down:w-4 xl-down:h-4 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 xl-down:mt-6 sm-down:mt-4 pt-6 xl-down:pt-5 sm-down:pt-4 border-t border-gray-100 dark:border-neutral-800">
            <p className="text-sm xl-down:text-xs sm-down:text-2xs text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {t('adminOnly', { defaultValue: 'Chỉ dành cho quản trị viên hệ thống' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
