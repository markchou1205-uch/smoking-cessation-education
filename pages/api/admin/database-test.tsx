// pages/admin/database-test.tsx
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  Play,
  Settings
} from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

const DatabaseTest: React.FC = () => {
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(null);
  const [statusResult, setStatusResult] = useState<TestResult | null>(null);
  const [initResult, setInitResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  // 頁面載入時自動測試連接
  useEffect(() => {
    testConnection();
    checkStatus();
  }, []);

  // 測試資料庫連接
  const testConnection = async () => {
    setLoading('connection');
    try {
      const response = await fetch('/api/admin/test-database?action=test');
      const data = await response.json();
      setConnectionResult(data);
    } catch (error) {
      setConnectionResult({
        success: false,
        message: `連接測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
      });
    } finally {
      setLoading(null);
    }
  };

  // 檢查資料庫狀態
  const checkStatus = async () => {
    setLoading('status');
    try {
      const response = await fetch('/api/admin/test-database?action=status');
      const data = await response.json();
      setStatusResult(data);
    } catch (error) {
      setStatusResult({
        success: false,
        message: `狀態檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
      });
    } finally {
      setLoading(null);
    }
  };

  // 初始化資料庫
  const initializeDatabase = async () => {
    setLoading('init');
    try {
      const response = await fetch('/api/admin/test-database?action=init', {
        method: 'POST'
      });
      const data = await response.json();
      setInitResult(data);
      
      // 初始化後重新檢查狀態
      if (data.success) {
        setTimeout(checkStatus, 1000);
      }
    } catch (error) {
      setInitResult({
        success: false,
        message: `初始化失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
      });
    } finally {
      setLoading(null);
    }
  };

  const ResultCard: React.FC<{ 
    title: string;
    result: TestResult | null;
    loading: boolean;
    onRefresh?: () => void;
    showDetails?: boolean;
  }> = ({ title, result, loading, onRefresh, showDetails = true }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center space-x-2 text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>測試中...</span>
        </div>
      ) : result ? (
        <div>
          <div className={`flex items-center space-x-2 mb-3 ${
            result.success ? 'text-green-600' : 'text-red-600'
          }`}>
            {result.success ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{result.message}</span>
          </div>

          {showDetails && result.details && (
            <div className="bg-gray-50 rounded p-3 text-sm">
              <pre className="whitespace-pre-wrap text-gray-700">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500">尚未測試</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">資料庫連接測試</h1>
          <p className="text-gray-600">檢查資料庫連接狀態和表格結構</p>
        </div>

        {/* 快速操作按鈕 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">快速操作</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testConnection}
              disabled={loading === 'connection'}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Database className="h-4 w-4 mr-2" />
              測試連接
            </button>
            
            <button
              onClick={checkStatus}
              disabled={loading === 'status'}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              檢查狀態
            </button>
            
            <button
              onClick={initializeDatabase}
              disabled={loading === 'init'}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              <Play className="h-4 w-4 mr-2" />
              初始化資料庫
            </button>
          </div>
        </div>

        {/* 測試結果 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ResultCard
            title="連接測試"
            result={connectionResult}
            loading={loading === 'connection'}
            onRefresh={testConnection}
          />

          <ResultCard
            title="資料庫狀態"
            result={statusResult}
            loading={loading === 'status'}
            onRefresh={checkStatus}
          />
        </div>

        {/* 初始化結果 */}
        {initResult && (
          <div className="mb-6">
            <ResultCard
              title="資料庫初始化"
              result={initResult}
              loading={loading === 'init'}
              showDetails={false}
            />
          </div>
        )}

        {/* 環境變數檢查 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">環境變數檢查</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">DATABASE_URL:</span>
              {typeof window !== 'undefined' && process.env.DATABASE_URL ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">POSTGRES_URL:</span>
              {typeof window !== 'undefined' && process.env.POSTGRES_URL ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">注意事項：</p>
                <ul className="mt-1 space-y-1">
                  <li>• 確保在 Vercel 或本地環境中設定了 DATABASE_URL 或 POSTGRES_URL</li>
                  <li>• 資料庫 URL 格式：postgresql://username:password@host:port/database</li>
                  <li>• 初次使用請先執行「初始化資料庫」建立所需表格</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest;
