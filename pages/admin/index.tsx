// pages/admin/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminDashboard from '../../components/AdminDashboard';

const AdminPage: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
            // Token 過期，清除本地存儲並重定向
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminExpiry');
            router.push('/admin/login');
            return;
          }
        } else {
          // 沒有登入，重定向到登入頁面
          router.push('/admin/login');
          return;
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // 登出處理
  const handleLogout = () => {
    // 確保在客戶端執行
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminExpiry');
    }
    router.push('/admin/login');
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
        <div className="text-lg">正在重定向到登入頁面...</div>
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
