// pages/admin/auth-test.tsx
import React, { useState, useEffect } from 'react';

const AuthTest: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminToken');
      const adminExpiry = localStorage.getItem('adminExpiry');
      
      const now = new Date().getTime();
      const isExpired = adminExpiry ? now >= parseInt(adminExpiry) : true;
      
      let tokenData = null;
      if (adminToken) {
        try {
          tokenData = JSON.parse(atob(adminToken));
        } catch (error) {
          tokenData = { error: '無法解析 token' };
        }
      }
      
      setAuthStatus({
        hasToken: !!adminToken,
        hasExpiry: !!adminExpiry,
        isExpired,
        tokenData,
        currentTime: now,
        expiryTime: adminExpiry ? parseInt(adminExpiry) : null,
        timeLeft: adminExpiry && !isExpired ? parseInt(adminExpiry) - now : 0
      });
    }
    setLoading(false);
  };

  const clearAuth = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminExpiry');
      checkAuthStatus();
    }
  };

  const testAdminAccess = () => {
    window.location.href = '/admin';
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">載入中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">認證狀態測試</h1>
          <p className="text-gray-600">檢查登入狀態和 token 資訊</p>
        </div>

        {/* 返回連結 */}
        <div className="mb-6">
          <a 
            href="/admin/login"
            className="text-blue-600 hover:text-blue-800 text-sm mr-4"
          >
            ← 返回登入頁面
          </a>
          <button
            onClick={checkAuthStatus}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            🔄 重新檢查
          </button>
        </div>

        {/* 認證狀態 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">認證狀態</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-3 rounded ${authStatus.hasToken ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <strong>Token 狀態:</strong> {authStatus.hasToken ? '✅ 存在' : '❌ 不存在'}
            </div>
            
            <div className={`p-3 rounded ${authStatus.hasExpiry ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <strong>過期時間:</strong> {authStatus.hasExpiry ? '✅ 存在' : '❌ 不存在'}
            </div>
            
            <div className={`p-3 rounded ${!authStatus.isExpired ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <strong>是否過期:</strong> {authStatus.isExpired ? '❌ 已過期' : '✅ 未過期'}
            </div>
            
            <div className="p-3 rounded bg-blue-50 text-blue-800">
              <strong>剩餘時間:</strong> {
                authStatus.timeLeft > 0 
                  ? `${Math.floor(authStatus.timeLeft / (1000 * 60 * 60))}小時 ${Math.floor((authStatus.timeLeft % (1000 * 60 * 60)) / (1000 * 60))}分鐘`
                  : '已過期'
              }
            </div>
          </div>

          {/* 詳細資訊 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">詳細資訊</h4>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">測試操作</h3>
          <div className="flex gap-3">
            <button
              onClick={testAdminAccess}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              測試訪問儀表板
            </button>
            
            <button
              onClick={clearAuth}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              清除認證資訊
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/login'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              重新登入
            </button>
          </div>
        </div>

        {/* 建議 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">除錯建議：</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 如果 token 存在但無法訪問儀表板，可能是頁面認證邏輯問題</li>
            <li>• 如果 token 已過期，請重新登入</li>
            <li>• 如果按鈕點擊無反應，請檢查瀏覽器控制台錯誤</li>
            <li>• 可以嘗試清除認證資訊後重新登入</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
