// pages/admin/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminDashboard from '../../components/AdminDashboard';

const AdminPage: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');

  // 檢查登入狀態
  useEffect(() => {
    const checkAuth = () => {
      // 確保在客戶端執行
      if (typeof window !== 'undefined') {
        const adminToken = localStorage.getItem('adminToken');
        const adminExpiry = localStorage.getItem('adminExpiry');
        
        if (adminToken && adminExpiry) {
          const now = new Date().getTime();
          if (now < parseInt(adminExpiry)) {
            setIsAuthenticated(true);
          } else {
            // Token 過期，清除本地存儲
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminExpiry');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // 登入處理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (data.success) {
        // 設定登入狀態和過期時間（24小時後）
        const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
        
        // 確保在客戶端執行
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminExpiry', expiry.toString());
        }
        
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || '登入失敗');
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      setLoginError('連線錯誤，請稍後再試');
    }
  };

  // 登出處理
  const handleLogout = () => {
    // 確保在客戶端執行
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminExpiry');
    }
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">管理員登入</h2>
            <p className="text-gray-600 mt-2">戒菸教育後台管理系統</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                帳號
              </label>
              <input
                type="text"
                id="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {loginError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {loginError}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              登入
            </button>
          </form>
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>預設帳號：admin</p>
            <p>預設密碼：admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 頂部導航欄 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                戒菸教育管理系統
              </h1>
              <span className="ml-3 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                管理員
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              登出
            </button>
          </div>
        </div>
      </div>

      {/* 管理員儀表板 */}
      <AdminDashboard />
    </div>
  );
};

export default AdminPage;
