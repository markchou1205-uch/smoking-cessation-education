import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, Settings, Users, BarChart3, Download, AlertCircle, CheckCircle } from 'lucide-react';

// 登入頁面
const AdminLogin = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        onLogin(data.token);
      } else {
        setError(data.message || '登入失敗');
      }
    } catch (error) {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">管理員登入</h1>
          <p className="text-gray-600 mt-2">戒菸教育系統後台</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              管理員帳號
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="請輸入管理員帳號"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密碼
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>健行科技大學軍訓室</p>
            <p>如有問題請聯絡系統管理員</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 系統設定頁面
const SystemSettings = () => {
  const [settings, setSettings] = useState({
    videoMinWatchTime: 600, // 最少觀看時間（秒）
    maxViolations: 5, // 最大違規次數
    minFocusPercentage: 80, // 最少專注度百分比
    quizPassScore: 80, // 測驗及格分數
    essayMinLength: 500, // 心得最少字數
    sessionTimeout: 3600, // 會話超時時間（秒）
    enableNotifications: true, // 啟用通知
    autoBackup: true, // 自動備份
    maintenanceMode: false // 維護模式
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage('設定已儲存');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('儲存失敗');
      }
    } catch (error) {
      setMessage('儲存失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('確定要重置為預設設定嗎？')) {
      setSettings({
        videoMinWatchTime: 600,
        maxViolations: 5,
        minFocusPercentage: 80,
        quizPassScore: 80,
        essayMinLength: 500,
        sessionTimeout: 3600,
        enableNotifications: true,
        autoBackup: true,
        maintenanceMode: false
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            系統設定
          </h2>
          {message && (
            <div className={`px-3 py-1 rounded text-sm ${
              message.includes('失敗') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 影片設定 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">影片觀看設定</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最少觀看時間（秒）
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={settings.videoMinWatchTime}
                onChange={(e) => setSettings({...settings, videoMinWatchTime: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大違規次數
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={settings.maxViolations}
                onChange={(e) => setSettings({...settings, maxViolations: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最少專注度百分比
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={settings.minFocusPercentage}
                onChange={(e) => setSettings({...settings, minFocusPercentage: parseInt(e.target.value)})}
              />
            </div>
          </div>

          {/* 測驗設定 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">測驗設定</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                測驗及格分數
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={settings.quizPassScore}
                onChange={(e) => setSettings({...settings, quizPassScore: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                心得最少字數
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={settings.essayMinLength}
                onChange={(e) => setSettings({...settings, essayMinLength: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                會話超時時間（秒）
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
              />
            </div>
          </div>

          {/* 系統設定 */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900">系統設定</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({...settings, enableNotifications: e.target.checked})}
                />
                啟用系統通知
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                />
                自動備份資料
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                />
                維護模式（停用學生端）
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            重置預設值
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {saving ? '儲存中...' : '儲存設定'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 資料管理頁面
const DataManagement = () => {
  const [backupStatus, setBackupStatus] = useState('ready');
  const [restoreFile, setRestoreFile] = useState<File | null>(null);

  const handleBackup = async () => {
    setBackupStatus('backing-up');
    try {
      const response = await fetch('/api/admin/backup', { method: 'POST' });
      const blob = await response.blob();
      
      // 建立下載連結
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setBackupStatus('completed');
      setTimeout(() => setBackupStatus('ready'), 3000);
    } catch (error) {
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('ready'), 3000);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      alert('請選擇要還原的備份檔案');
      return;
    }

    if (!confirm('確定要還原資料庫嗎？這將覆蓋所有現有資料！')) {
      return;
    }

    const formData = new FormData();
    formData.append('backup', restoreFile);

    try {
      const response = await fetch('/api/admin/restore', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('資料還原成功！');
        setRestoreFile(null);
      } else {
        throw new Error('還原失敗');
      }
    } catch (error) {
      alert('資料還原失敗，請檢查檔案格式');
    }
  };

  const handleClearData = async (dataType: string) => {
    const confirmText = {
      'students': '學生資料',
      'surveys': '調查結果',
      'videos': '影片記錄',
      'quiz': '測驗結果',
      'all': '所有資料'
    }[dataType];

    if (!confirm(`確定要清除${confirmText}嗎？此操作無法復原！`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/clear-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType })
      });

      if (response.ok) {
        alert(`${confirmText}已清除成功`);
      } else {
        throw new Error('清除失敗');
      }
    } catch (error) {
      alert('清除失敗，請重試');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 備份管理 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          資料備份與還原
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 備份 */}
          <div>
            <h3 className="text-lg font-medium mb-4">建立備份</h3>
            <p className="text-gray-600 mb-4">
              備份所有系統資料，包括學生記錄、調查結果、測驗成績等。
            </p>
            <button
              onClick={handleBackup}
              disabled={backupStatus !== 'ready'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {backupStatus === 'ready' && '開始備份'}
              {backupStatus === 'backing-up' && '備份中...'}
              {backupStatus === 'completed' && '備份完成 ✓'}
              {backupStatus === 'error' && '備份失敗 ✗'}
            </button>
          </div>

          {/* 還原 */}
          <div>
            <h3 className="text-lg font-medium mb-4">還原資料</h3>
            <p className="text-gray-600 mb-4">
              從備份檔案還原資料。注意：這將覆蓋現有資料！
            </p>
            <input
              type="file"
              accept=".sql,.backup"
              className="w-full mb-3 p-2 border border-gray-300 rounded-md"
              onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={handleRestore}
              disabled={!restoreFile}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:bg-gray-400"
            >
              還原資料
            </button>
          </div>
        </div>
      </div>

      {/* 資料清理 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
          資料清理（危險操作）
        </h2>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700 text-sm">
            ⚠️ 以下操作將永久刪除資料，請謹慎使用！建議先進行備份。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => handleClearData('students')}
            className="p-4 border-2 border-red-300 text-red-700 rounded-md hover:bg-red-50"
          >
            <div className="font-medium">清除學生資料</div>
            <div className="text-sm text-gray-600">刪除所有學生基本資料</div>
          </button>

          <button
            onClick={() => handleClearData('surveys')}
            className="p-4 border-2 border-red-300 text-red-700 rounded-md hover:bg-red-50"
          >
            <div className="font-medium">清除調查結果</div>
            <div className="text-sm text-gray-600">刪除所有吸菸調查結果</div>
          </button>

          <button
            onClick={() => handleClearData('videos')}
            className="p-4 border-2 border-red-300 text-red-700 rounded-md hover:bg-red-50"
          >
            <div className="font-medium">清除影片記錄</div>
            <div className="text-sm text-gray-600">刪除所有影片觀看記錄</div>
          </button>

          <button
            onClick={() => handleClearData('quiz')}
            className="p-4 border-2 border-red-300 text-red-700 rounded-md hover:bg-red-50"
          >
            <div className="font-medium">清除測驗結果</div>
            <div className="text-sm text-gray-600">刪除所有測驗成績</div>
          </button>

          <button
            onClick={() => handleClearData('all')}
            className="p-4 border-2 border-red-500 text-red-800 rounded-md hover:bg-red-100 md:col-span-2"
          >
            <div className="font-medium">清除所有資料</div>
            <div className="text-sm text-gray-600">⚠️ 刪除所有系統資料</div>
          </button>
        </div>
      </div>

      {/* 系統資訊 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">系統資訊</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-700">系統版本</div>
            <div className="text-gray-600">v1.0.0</div>
          </div>
          <div>
            <div className="font-medium text-gray-700">資料庫版本</div>
            <div className="text-gray-600">PostgreSQL 15</div>
          </div>
          <div>
            <div className="font-medium text-gray-700">最後備份時間</div>
            <div className="text-gray-600">2024-03-15 10:30:00</div>
          </div>
          <div>
            <div className="font-medium text-gray-700">系統狀態</div>
            <div className="text-green-600">● 正常運行</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 主管理系統整合
const AdminSystem = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // 驗證 token 有效性
      fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
        }
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 導航列 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                戒菸教育管理系統
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                管理員已登入
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* 側邊欄 */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                總覽
              </button>
              
              <button
                onClick={() => setCurrentView('records')}
                className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                  currentView === 'records' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4 mr-3" />
                執行記錄
              </button>
              
              <button
                onClick={() => setCurrentView('statistics')}
                className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                  currentView === 'statistics' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                統計分析
              </button>
              
              <button
                onClick={() => setCurrentView('settings')}
                className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                  currentView === 'settings' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4 mr-3" />
                系統設定
              </button>
              
              <button
                onClick={() => setCurrentView('data')}
                className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                  currentView === 'data' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Download className="w-4 h-4 mr-3" />
                資料管理
              </button>
            </div>
          </nav>
        </div>

        {/* 主要內容區 */}
        <div className="flex-1 p-8">
          {currentView === 'dashboard' && <DashboardOverview />}
          {currentView === 'records' && <StudentRecordsView />}
          {currentView === 'statistics' && <StatisticsView />}
          {currentView === 'settings' && <SystemSettings />}
          {currentView === 'data' && <DataManagement />}
        </div>
      </div>
    </div>
  );
};

// 總覽頁面
const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    completedStudents: 0,
    averageFocus: 0,
    totalViolations: 0,
    recentActivity: []
  });

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">系統總覽</h2>
      
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">總參與人數</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              <p className="text-sm text-gray-600">本學期累計</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">完成人數</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.completedStudents}</p>
              <p className="text-sm text-gray-600">
                完成率 {stats.totalStudents > 0 ? Math.round((stats.completedStudents/stats.totalStudents)*100) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">平均專注度</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.averageFocus}%</p>
              <p className="text-sm text-gray-600">影片觀看專注度</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-500">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">總違規次數</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViolations}</p>
              <p className="text-sm text-gray-600">需要關注</p>
            </div>
          </div>
        </div>
      </div>

      {/* 快速動作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">快速動作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Download className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="font-medium">匯出今日記錄</div>
            <div className="text-sm text-gray-600">下載 Excel 報表</div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="font-medium">生成統計報告</div>
            <div className="text-sm text-gray-600">週/月報表</div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
            <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="font-medium">系統維護</div>
            <div className="text-sm text-gray-600">備份與清理</div>
          </button>
        </div>
      </div>

      {/* 最近活動 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">最近活動</h3>
        <div className="space-y-3">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity: any, index: number) => (
              <div key={index} className="flex items-center p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.description}</div>
                  <div className="text-xs text-gray-600">{activity.timestamp}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              暫無最近活動記錄
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 學生記錄檢視（簡化版）
const StudentRecordsView = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">學生執行記錄</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          這裡顯示詳細的學生記錄表格，包含搜尋、篩選和匯出功能。
          <br />
          請參考主要的 AdminDashboard 組件中的 StudentRecordsTable。
        </p>
      </div>
    </div>
  );
};

// 統計分析檢視（簡化版）
const StatisticsView = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">統計分析</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          這裡顯示詳細的統計圖表，包含各種調查結果的視覺化分析。
          <br />
          請參考主要的 AdminDashboard 組件中的 SurveyCharts。
        </p>
      </div>
    </div>
  );
};

export default AdminSystem; 
