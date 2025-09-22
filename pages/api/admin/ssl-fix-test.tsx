// pages/admin/ssl-fix-test.tsx
import React, { useState } from 'react';

interface TestResult {
  success: boolean;
  message: string;
  method?: string;
  details?: any;
}

const SSLFixTest: React.FC = () => {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async (action: string) => {
    setLoading(true);
    setResult(null);
    
    try {
      const method = action === 'init' ? 'POST' : 'GET';
      const response = await fetch(`/api/admin/test-ssl-fix?action=${action}`, { method });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: `請求失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SSL 問題修正測試</h1>
          <p className="text-gray-600">專門解決自簽名證書問題的測試工具</p>
        </div>

        {/* 返回連結 */}
        <div className="mb-6">
          <a 
            href="/admin/db-test"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← 返回標準測試頁面
          </a>
        </div>

        {/* 警告提示 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">注意事項</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>這個測試會完全禁用 SSL 證書驗證來解決連接問題。這是針對開發/測試環境的解決方案。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">SSL 修正測試</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => runTest('test')}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {loading ? '測試中...' : '多方法連接測試'}
            </button>
            
            <button
              onClick={() => runTest('simple')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {loading ? '查詢中...' : '簡單查詢測試'}
            </button>
            
            <button
              onClick={() => runTest('status')}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
            >
              {loading ? '檢查中...' : '檢查表格狀態'}
            </button>
            
            <button
              onClick={() => runTest('init')}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
            >
              {loading ? '初始化中...' : '初始化資料庫'}
            </button>
          </div>

          {/* 測試結果 */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">處理中...</span>
            </div>
          )}

          {result && !loading && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {result.success ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-medium">
                    {result.message}
                  </div>
                  {result.method && (
                    <div className="text-sm mt-1">
                      成功方法: {result.method}
                    </div>
                  )}
                </div>
              </div>
              
              {result.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    查看詳細資訊
                  </summary>
                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* 說明 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">修正方法說明</h3>
          <div className="text-sm text-gray-600 space-y-3">
            <div>
              <strong className="text-gray-900">多方法連接測試：</strong>
              <p>自動嘗試「禁用 SSL」和「寬鬆 SSL」兩種連接方式，找出可用的方法。</p>
            </div>
            <div>
              <strong className="text-gray-900">簡單查詢測試：</strong>
              <p>使用找到的可用方法執行簡單的 SQL 查詢。</p>
            </div>
            <div>
              <strong className="text-gray-900">檢查表格狀態：</strong>
              <p>查看資料庫中已存在的表格和缺少的表格。</p>
            </div>
            <div>
              <strong className="text-gray-900">初始化資料庫：</strong>
              <p>建立系統所需的所有表格和索引。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSLFixTest;
