// pages/admin/db-test.tsx
import React, { useState } from 'react';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

const DatabaseTestSimple: React.FC = () => {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async (action: string) => {
    setLoading(true);
    try {
      const method = action === 'init' ? 'POST' : 'GET';
      const response = await fetch(`/api/admin/test-database?action=${action}`, { method });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: `測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">資料庫連接測試</h1>
          <p className="text-gray-600">簡化版測試工具</p>
        </div>

        {/* 返回連結 */}
        <div className="mb-6">
          <a 
            href="/admin/login"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← 返回管理員登入
          </a>
        </div>

        {/* 操作按鈕 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">測試操作</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => runTest('test')}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '測試中...' : '測試連接'}
            </button>
            
            <button
              onClick={() => runTest('status')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '檢查中...' : '檢查狀態'}
            </button>
            
            <button
              onClick={() => runTest('init')}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '初始化中...' : '初始化資料庫'}
            </button>

            <button
              onClick={() => runTest('vercel')}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '測試中...' : 'Vercel Postgres 測試'}
            </button>
            
            <button
              onClick={() => runTest('env')}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '檢查中...' : '檢查環境變數'}
            </button>
          </div>

          {/* 測試結果 */}
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="font-medium mb-2">
                {result.success ? '✅ ' : '❌ '}{result.message}
              </div>
              
              {result.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    查看詳細資訊
                  </summary>
                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* 說明 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">使用說明</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>測試連接：</strong>檢查是否能連接到資料庫</p>
            <p><strong>檢查狀態：</strong>查看所需資料表是否已建立</p>
            <p><strong>初始化資料庫：</strong>建立所有必要的資料表</p>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>注意：</strong>請確保在 Vercel 中已設定 DATABASE_URL 或 POSTGRES_URL 環境變數
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTestSimple;
