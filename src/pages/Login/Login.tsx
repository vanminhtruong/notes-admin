import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    // Xóa token không hợp lệ và kiểm tra authentication
    if (isAdminAuthenticated()) {
      navigate('/dashboard', { replace: true });
    } else {
      removeAdminToken(); // Xóa token không hợp lệ nếu có
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminService.login(email, password);
      
      // Validate token và kiểm tra role
      const adminData = validateAdminToken(response.token);
      if (!adminData || adminData.role !== 'admin') {
        throw new Error('Không có quyền truy cập admin');
      }

      // Lưu token và chuyển hướng
      setAdminToken(response.token);
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Theme Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-3 rounded-lg bg-white/10 dark:bg-neutral-800/50 hover:bg-white/20 dark:hover:bg-neutral-700/50 transition-colors backdrop-blur-sm"
            title={mode === 'dark' ? t('toggleLight') : t('toggleDark')}
          >
            <span className="text-xl">{mode === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('title', { defaultValue: 'Admin Panel' })}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('subtitle', { defaultValue: 'Sign in to admin panel' })}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('loading', { defaultValue: 'Đang đăng nhập...' })}
                </div>
              ) : (
                t('loginButton', { defaultValue: 'Đăng nhập' })
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('adminOnly', { defaultValue: 'Chỉ dành cho quản trị viên hệ thống' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
