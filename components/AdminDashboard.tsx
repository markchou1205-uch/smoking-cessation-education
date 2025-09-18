// components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar as RechartsBar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Users, 
  FileText, 
  Video, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  BookOpen, 
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface AdminDashboardProps {
  // 可以接收外部數據或配置
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedInstructor, setSelectedInstructor] = useState('all');
  const [activeTab, setActiveTab] = useState<'records' | 'statistics'>('records');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 載入資料
  const loadData = async () => {
    setLoading(true);
    try {
      // 同時獲取學生記錄和統計數據
      const [recordsResponse, statsResponse] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/admin/statistics')
      ]);

      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        setStudentRecords(recordsData.data || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData.data);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('載入資料錯誤:', error);
      alert('載入資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    loadData();
  }, []);

  // 過濾學生記錄
  const filteredRecords = studentRecords.filter(record => {
    const matchesSearch = record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || record.class?.includes(selectedClass);
    const matchesInstructor = selectedInstructor === 'all' || record.instructor === selectedInstructor;
    
    return matchesSearch && matchesClass && matchesInstructor;
  });

  // 獲取唯一的班級和教官列表
  const uniqueClasses = Array.from(new Set(
    studentRecords
      .map(r => r.class?.split('系')[0] + '系')
      .filter(Boolean)
  ));
  
  const uniqueInstructors = Array.from(new Set(
    studentRecords
      .map(r => r.instructor)
      .filter(Boolean)
  ));

  // 圖表顏色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const exportToCSV = () => {
    const csvContent = [
      ['姓名', '班級', '學號', '手機', '輔導教官', '建立日期', '狀態'].join(','),
      ...filteredRecords.map(record => [
        record.name || '',
        record.class || '',
        record.studentId || '',
        record.phone || '',
        record.instructor || '',
        record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '',
        record.status === 'completed' ? '已完成' : '進行中'
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `戒菸教育記錄_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg">載入中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題與刷新按鈕 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">戒菸教育後台管理系統</h1>
            <p className="text-gray-600">健行科技大學戒菸教育執行記錄與統計分析</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                最後更新：{lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={loadData}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              重新載入
            </button>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總參與人數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.totalStudents || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成人數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.completedStudents || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">完成率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.completionRate || 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日新增</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentRecords.filter(r => {
                    const today = new Date().toDateString();
                    const recordDate = new Date(r.createdAt).toDateString();
                    return recordDate === today;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 頁籤切換 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('records')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'records'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="inline-block w-4 h-4 mr-2" />
                學生記錄
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'statistics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="inline-block w-4 h-4 mr-2" />
                統計分析
              </button>
            </nav>
          </div>

          {/* 學生記錄頁籤 */}
          {activeTab === 'records' && (
            <div className="p-6">
              {/* 篩選工具 */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="搜尋姓名或學號..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">所有科系</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                
                <select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">所有教官</option>
                  {uniqueInstructors.map(instructor => (
                    <option key={instructor} value={instructor}>{instructor}</option>
                  ))}
                </select>
                
                <button
                  onClick={exportToCSV}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  匯出 CSV
                </button>
              </div>

              {/* 記錄表格 */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        學生資訊
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        班級
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        手機
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        輔導教官
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        建立日期
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        狀態
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          {searchTerm || selectedClass !== 'all' || selectedInstructor !== 'all' 
                            ? '沒有符合條件的記錄' 
                            : '目前沒有學生記錄'}
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record, index) => (
                        <tr key={record.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{record.name}</div>
                              <div className="text-sm text-gray-500">{record.studentId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.class}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.instructor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              record.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.status === 'completed' ? '已完成' : '進行中'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 分頁資訊 */}
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <span>共 {filteredRecords.length} 筆記錄</span>
                <span>顯示 1-{Math.min(filteredRecords.length, 50)} 筆</span>
              </div>
            </div>
          )}

          {/* 統計分析頁籤 */}
          {activeTab === 'statistics' && statistics && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 開始吸菸年齡統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">開始吸菸年齡分布</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statistics.dailyAmountStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 吸菸原因統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">吸菸原因統計</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statistics.reasonsStats} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={60} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 菸品類型統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">菸品類型分布</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statistics.tobaccoTypeStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statistics.tobaccoTypeStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 戒菸意願統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">戒菸意願分布</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statistics.quitIntentionStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statistics.quitIntentionStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 輔導教官統計 */}
                {statistics.instructorStats && statistics.instructorStats.length > 0 && (
                  <div className="bg-white p-6 rounded-lg border lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">輔導教官分佈</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={statistics.instructorStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <RechartsBar dataKey="value" fill="#ff7c7c" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;="100%" height={300}>
                    <BarChart data={statistics.startSmokingStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 吸菸頻率統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">吸菸頻率分布</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statistics.frequencyStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statistics.frequencyStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 每日吸菸量統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">每日吸菸量分布</h3>
                  <ResponsiveContainer width// components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Users, FileText, Video, CheckCircle, AlertTriangle, Download, Search, Filter, Calendar, BookOpen } from 'lucide-react';

// 模擬數據 - 實際部署時應從 API 獲取
const mockStudentRecords = [
  {
    id: 1,
    name: '王小明',
    class: '資工系二甲',
    studentId: 'CS2023001',
    instructor: '李教官',
    completedDate: '2024-01-15',
    surveyData: {
      startSmoking: '高中階段',
      frequency: '每天抽',
      dailyAmount: '5-9支',
      reasons: ['放鬆', '習慣'],
      familySmoking: '有',
      campusAwareness: '知道',
      signageAwareness: '有',
      tobaccoType: '紙煙',
      quitAttempts: '有',
      quitIntention: '有',
      counselingInterest: '有'
    },
    selectedEvent: '114年9月24日',
    status: 'completed'
  },
  {
    id: 2,
    name: '陳小華',
    class: '企管系一乙',
    studentId: 'BM2024002',
    instructor: '張教官',
    completedDate: '2024-01-16',
    surveyData: {
      startSmoking: '大學以後',
      frequency: '1-2天抽1次',
      dailyAmount: '1-2支',
      reasons: ['交際', '打發時間'],
      familySmoking: '沒有',
      campusAwareness: '知道',
      signageAwareness: '有',
      tobaccoType: '電子煙',
      quitAttempts: '沒有',
      quitIntention: '有',
      counselingInterest: '有'
    },
    selectedEvent: '114年11月19日',
    status: 'completed'
  }
];

// 統計數據處理
const generateStatistics = (records: any[]) => {
  const stats = {
    // 開始吸菸年齡統計
    startSmokingStats: [
      { name: '國小階段', value: 0 },
      { name: '國中階段', value: 0 },
      { name: '高中階段', value: 0 },
      { name: '大學以後', value: 0 }
    ],
    // 吸菸頻率統計
    frequencyStats: [
      { name: '每天抽', value: 0 },
      { name: '1-2天抽1次', value: 0 },
      { name: '3-4天抽1次', value: 0 },
      { name: '1週抽1次', value: 0 }
    ],
    // 每日吸菸量統計
    dailyAmountStats: [
      { name: '1-2支', value: 0 },
      { name: '3-4支', value: 0 },
      { name: '5-9支', value: 0 },
      { name: '10支以上', value: 0 }
    ],
    // 吸菸原因統計
    reasonsStats: [
      { name: '專心', value: 0 },
      { name: '放鬆', value: 0 },
      { name: '習慣', value: 0 },
      { name: '交際', value: 0 },
      { name: '打發時間', value: 0 },
      { name: '其它', value: 0 }
    ],
    // 菸品類型統計
    tobaccoTypeStats: [
      { name: '紙煙', value: 0 },
      { name: '電子煙', value: 0 },
      { name: '加熱煙', value: 0 }
    ],
    // 戒菸意願統計
    quitIntentionStats: [
      { name: '有戒菸意願', value: 0 },
      { name: '無戒菸意願', value: 0 }
    ]
  };

  records.forEach(record => {
    const survey = record.surveyData;
    
    // 統計開始吸菸年齡
    const startIdx = stats.startSmokingStats.findIndex(s => s.name === survey.startSmoking);
    if (startIdx !== -1) stats.startSmokingStats[startIdx].value++;
    
    // 統計吸菸頻率
    const freqIdx = stats.frequencyStats.findIndex(s => s.name === survey.frequency);
    if (freqIdx !== -1) stats.frequencyStats[freqIdx].value++;
    
    // 統計每日吸菸量
    const amountIdx = stats.dailyAmountStats.findIndex(s => s.name === survey.dailyAmount);
    if (amountIdx !== -1) stats.dailyAmountStats[amountIdx].value++;
    
    // 統計吸菸原因（可能多選）
    survey.reasons.forEach((reason: string) => {
      const reasonIdx = stats.reasonsStats.findIndex(s => s.name === reason);
      if (reasonIdx !== -1) stats.reasonsStats[reasonIdx].value++;
    });
    
    // 統計菸品類型
    const typeIdx = stats.tobaccoTypeStats.findIndex(s => s.name === survey.tobaccoType);
    if (typeIdx !== -1) stats.tobaccoTypeStats[typeIdx].value++;
    
    // 統計戒菸意願
    const intentionIdx = stats.quitIntentionStats.findIndex(s => 
      s.name === (survey.quitIntention === '有' ? '有戒菸意願' : '無戒菸意願')
    );
    if (intentionIdx !== -1) stats.quitIntentionStats[intentionIdx].value++;
  });

  return stats;
};

interface AdminDashboardProps {
  // 可以接收外部數據或配置
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [studentRecords, setStudentRecords] = useState(mockStudentRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedInstructor, setSelectedInstructor] = useState('all');
  const [activeTab, setActiveTab] = useState<'records' | 'statistics'>('records');

  const statistics = generateStatistics(studentRecords);

  // 過濾學生記錄
  const filteredRecords = studentRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || record.class.includes(selectedClass);
    const matchesInstructor = selectedInstructor === 'all' || record.instructor === selectedInstructor;
    
    return matchesSearch && matchesClass && matchesInstructor;
  });

  // 獲取唯一的班級和教官列表
  const uniqueClasses = Array.from(new Set(studentRecords.map(r => r.class.split('系')[0] + '系')));
  const uniqueInstructors = Array.from(new Set(studentRecords.map(r => r.instructor)));

  // 圖表顏色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const exportToCSV = () => {
    const csvContent = [
      ['姓名', '班級', '學號', '輔導教官', '完成日期', '選擇場次', '狀態'].join(','),
      ...filteredRecords.map(record => [
        record.name,
        record.class,
        record.studentId,
        record.instructor,
        record.completedDate,
        record.selectedEvent,
        record.status === 'completed' ? '已完成' : '進行中'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '戒菸教育記錄.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">戒菸教育後台管理系統</h1>
          <p className="text-gray-600">健行科技大學戒菸教育執行記錄與統計分析</p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總參與人數</p>
                <p className="text-2xl font-bold text-gray-900">{studentRecords.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成人數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentRecords.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均完成率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((studentRecords.filter(r => r.status === 'completed').length / studentRecords.length) * 100)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">本月新增</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentRecords.filter(r => r.completedDate.includes('2024-01')).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 頁籤切換 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('records')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'records'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="inline-block w-4 h-4 mr-2" />
                學生記錄
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'statistics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart className="inline-block w-4 h-4 mr-2" />
                統計分析
              </button>
            </nav>
          </div>

          {/* 學生記錄頁籤 */}
          {activeTab === 'records' && (
            <div className="p-6">
              {/* 篩選工具 */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="搜尋姓名或學號..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">所有科系</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                
                <select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">所有教官</option>
                  {uniqueInstructors.map(instructor => (
                    <option key={instructor} value={instructor}>{instructor}</option>
                  ))}
                </select>
                
                <button
                  onClick={exportToCSV}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  匯出 CSV
                </button>
              </div>

              {/* 記錄表格 */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        學生資訊
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        班級
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        輔導教官
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        完成日期
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        選擇場次
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        狀態
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.name}</div>
                            <div className="text-sm text-gray-500">{record.studentId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.instructor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.completedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.selectedEvent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status === 'completed' ? '已完成' : '進行中'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 統計分析頁籤 */}
          {activeTab === 'statistics' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 開始吸菸年齡統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">開始吸菸年齡分布</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={statistics.startSmokingStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <RechartsBar dataKey="value" fill="#8884d8" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>

                {/* 吸菸頻率統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">吸菸頻率分布</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statistics.frequencyStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statistics.frequencyStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 每日吸菸量統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">每日吸菸量分布</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statistics.dailyAmountStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 吸菸原因統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">吸菸原因統計</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statistics.reasonsStats} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 菸品類型統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">菸品類型分布</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statistics.tobaccoTypeStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statistics.tobaccoTypeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 戒菸意願統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">戒菸意願分布</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statistics.quitIntentionStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statistics.quitIntentionStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
