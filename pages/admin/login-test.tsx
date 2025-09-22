// pages/admin/login-test.tsx - 登入 API 測試頁面
import React, { useState } from 'react';

const LoginTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLoginAPI = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('測試登入 API...');
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = {
          success: false,
          error: 'JSON 解析失敗',
          rawResponse: responseText,
          parseError: parseError instanceof Error ? parseError.message : String(parseError)
        };
      }

      setResult({
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        rawResponse: responseText
      });

    } catch (error) {
      console.error('API 測試錯誤:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        type: 'network_error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testWrongCredentials = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'wrong',
          password: 'wrong'
        }),
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = {
          success: false,
          error: 'JSON 解析失敗',
          rawResponse: responseText
        };
      }

      setResult({
        testType: '錯誤憑證測試',
        status: response.status,
        ok: response.ok,
        data,
        rawResponse: responseText
      });

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        type: 'network_error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">登入 API 測試</h1>
          <p className="text-gray-600">測試登入 API 是否正常運作</p>
        </div>

        {/* 返回連結 */}
        <div className="mb-6">
          <a 
            href="/admin/login"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← 返回登入頁面
          </a>
        </div>

        {/* 測試按鈕 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">API 測試</h3>
          <div className="flex gap-3 mb-6">
            <button
              onClick={testLoginAPI}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '測試中...' : '測試正確登入'}
            </button>
            
            <button
              onClick={testWrongCredentials}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? '測試中...' : '測試錯誤憑證'}
            </button>
          </div>

          {/* 測試結果 */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">測試中...</span>
            </div>
          )}

          {result && !loading && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">測試結果</h4>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* API 資訊 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">API 資訊</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>端點：</strong>/api/admin/login</p>
            <p><strong>方法：</strong>POST</p>
            <p><strong>預設帳號：</strong>admin / admin123</p>
            <p><strong>備用帳號：</strong>teacher / teacher123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginTest;
