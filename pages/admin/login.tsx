// pages/admin/login.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // 檢查是否已經登入
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminToken');
      const adminExpiry = localStorage.getItem('adminExpiry');
      
      if (adminToken && adminExpiry) {
        const now = new Date().getTime();
        if (now < parseInt(adminExpiry)) {
          // 已經登入，重定向到儀表板
          router.push('/admin');
          return;
        } else {
          // Token 過期，清除本地存儲
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminExpiry');
        }
      }
    }
  }, [router]);

  // 登入處理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

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
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminExpiry', expiry.toString());
        }
        
        // 重定向到儀表板
        router.push('/admin');
      } else {
        setLoginError(data.error || '登入失敗');
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      setLoginError('連線錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          
          {loginError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {loginError}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>預設帳號：admin</p>
          <p>預設密碼：admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
