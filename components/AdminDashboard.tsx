import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileText, Video, CheckCircle, AlertTriangle, Download, Search, Filter } from 'lucide-react';

// 模擬數據
const mockStudentRecords = [
  {
    id: 1,
    name: '王小明',
    class: '資工四甲',
    studentId: '1234567',
    instructor: '李教官',
    executionDate: '2024-03-15',
    surveyCompleted: true,
    videosCompleted: true,
    quizCompleted: true,
    essayCompleted: true,
    eventSelected: '114年9月24日',
    totalVideoTime: '12分30秒',
    violations: 2,
    focusPercentage: 85
  },
  {
    id: 2,
    name: '陳美華',
    class: '企管三乙',
    studentId: '2345678',
    instructor: '張教官',
    executionDate: '2024-03-16',
    surveyCompleted: true,
    videosCompleted: true,
    quizCompleted: true,
    essayCompleted: true,
    eventSelected: '114年11月19日',
    totalVideoTime: '15分45秒',
    violations: 0,
    focusPercentage: 98
  }
];
const mockSurveyStats = {
  startSmoking: [
    { name: '大學以後', value: 45, percentage: 45 },
    { name: '高中階段', value: 35, percentage: 35 },
    { name: '國中階段', value: 15, percentage: 15 },
    { name: '國小階段', value: 5, percentage: 5 }
  ],
  frequency: [
    { name: '每天抽', value: 30, percentage: 30 },
    { name: '1-2天抽1次', value: 25, percentage: 25 },
    { name: '3-4天抽1次', value: 25, percentage: 25 },
    { name: '1週抽1次', value: 20, percentage: 20 }
  ],
  dailyAmount: [
    { name: '1-2支', value: 40, percentage: 40 },
    { name: '3-4支', value: 30, percentage: 30 },
    { name: '5-9支', value: 20, percentage: 20 },
    { name: '10支以上', value: 10, percentage: 10 }
  ],
  reasons: [
    { name: '習慣', value: 35 },
    { name: '放鬆', value: 28 },
    { name: '交際', value: 20 },
    { name: '專心', value: 12 },
    { name: '打發時間', value: 15 },
    { name: '其它', value: 8 }
  ],
  quitIntention: [
    { name: '有意願', value: 65, percentage: 65 },
    { name: '沒有意願', value: 35, percentage: 35 }
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// 統計卡片組件
const StatCard = ({ title, value, icon: Icon, color, description }: any) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    </div>
  </div>
);

// 學生記錄表格
const StudentRecordsTable = ({ records, onExport }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredRecords = records.filter((record: any) => {
    const matchesSearch = record.name.includes(searchTerm) || 
                         record.studentId.includes(searchTerm) ||
                         record.class.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'completed' && record.essayCompleted) ||
                         (filterStatus === 'incomplete' && !record.essayCompleted);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">戒菸教育執行記錄</h2>
          <button
            onClick={onExport}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            匯出 Excel
          </button>
        </div>
        
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋姓名、學號、班級..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border rounded-lg"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">全部狀態</option>
            <option value="completed">已完成</option>
            <option value="incomplete">未完成</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">學生資訊</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">執行日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">影片觀看</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">測驗</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">心得</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">選擇場次</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">專注度</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.map((record: any) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{record.name}</div>
                    <div className="text-sm text-gray-600">{record.class}</div>
                    <div className="text-sm text-gray-600">{record.studentId}</div>
                    <div className="text-sm text-gray-600">教官：{record.instructor}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{record.executionDate}</td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {record.videosCompleted ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {record.totalVideoTime}
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {record.totalVideoTime}
                      </span>
                    )}
                    <div className="text-xs text-gray-500">
                      違規: {record.violations}次
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {record.quizCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </td>
                <td className="px-6 py-4">
                  {record.essayCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </td>
                <td className="px-6 py-4 text-sm">{record.eventSelected || '未選擇'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-16 h-2 bg-gray-200 rounded mr-2">
                      <div 
                        className={`h-2 rounded ${
                          record.focusPercentage >= 80 ? 'bg-green-500' : 
                          record.focusPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${record.focusPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{record.focusPercentage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {record.essayCompleted ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      已完成
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                      進行中
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredRecords.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          沒有找到符合條件的記錄
        </div>
      )}
    </div>
  );
};

// 圖表組件
const SurveyCharts = ({ data }: any) => (
  <div className="space-y-8">
    {/* 開始吸菸時期 */}
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">開始吸菸時期分佈</h3>
      <div className="flex flex-col lg:flex-row items-center">
        <div className="w-full lg:w-2/3">
          <BarChart width={500} height={300} data={data.startSmoking}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
        <div className="w-full lg:w-1/3 mt-4 lg:mt-0">
          <PieChart width={250} height={250}>
            <Pie
              data={data.startSmoking}
              cx={125}
              cy={125}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percentage }) => `${name}: ${percentage}%`}
            >
              {data.startSmoking.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>

    {/* 吸菸頻率 */}
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">吸菸頻率分佈</h3>
      <BarChart width={600} height={300} data={data.frequency}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>
    </div>

    {/* 每日吸菸量 */}
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">每日吸菸量分佈</h3>
      <div className="flex flex-col lg:flex-row items-center">
        <div className="w-full lg:w-1/2">
          <PieChart width={300} height={300}>
            <Pie
              data={data.dailyAmount}
              cx={150}
              cy={150}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percentage }) => `${name}: ${percentage}%`}
            >
              {data.dailyAmount.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div className="w-full lg:w-1/2">
          <div className="space-y-2">
            {data.dailyAmount.map((item: any, index: number) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm">{item.name}: {item.value}人 ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* 吸菸原因 */}
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">吸菸原因分析</h3>
      <BarChart width={600} height={300} data={data.reasons}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#ff7300" />
      </BarChart>
    </div>

    {/* 戒菸意願 */}
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">戒菸意願分佈</h3>
      <div className="flex justify-center">
        <PieChart width={400} height={300}>
          <Pie
            data={data.quitIntention}
            cx={200}
            cy={150}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percentage }) => `${name}: ${percentage}%`}
          >
            {data.quitIntention.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#00C49F' : '#FF8042'} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </div>
  </div>
);

// 主後台組件
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [records, setRecords] = useState(mockStudentRecords);

  const handleExport = () => {
    // 實際實作會調用 API 匯出 Excel
    alert('正在匯出資料到 Excel...');
  };

  const completedCount = records.filter(r => r.essayCompleted).length;
  const totalCount = records.length;
  const averageFocus = Math.round(records.reduce((sum, r) => sum + r.focusPercentage, 0) / records.length);
  const violationsCount = records.reduce((sum, r) => sum + r.violations, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">戒菸教育管理系統</h1>
            <div className="text-sm text-gray-600">
              健行科技大學 - 軍訓室
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 導航標籤 */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            總覽
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'records' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            執行記錄
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'statistics' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            統計分析
          </button>
        </div>

        {/* 總覽頁面 */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="總參與人數"
                value={totalCount}
                icon={Users}
                color="bg-blue-500"
                description="本學期累計"
              />
              <StatCard
                title="完成人數"
                value={completedCount}
                icon={CheckCircle}
                color="bg-green-500"
                description={`完成率 ${Math.round((completedCount/totalCount)*100)}%`}
              />
              <StatCard
                title="平均專注度"
                value={`${averageFocus}%`}
                icon={Video}
                color="bg-yellow-500"
                description="影片觀看專注度"
              />
              <StatCard
                title="總違規次數"
                value={violationsCount}
                icon={AlertTriangle}
                color="bg-red-500"
                description="需要關注"
              />
            </div>

            {/* 最近記錄 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">最近執行記錄</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {records.slice(0, 5).map(record => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{record.name}</div>
                        <div className="text-sm text-gray-600">{record.class} - {record.studentId}</div>
                        <div className="text-sm text-gray-600">{record.executionDate}</div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          record.essayCompleted 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.essayCompleted ? '已完成' : '進行中'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          專注度: {record.focusPercentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 執行記錄頁面 */}
        {activeTab === 'records' && (
          <StudentRecordsTable records={records} onExport={handleExport} />
        )}

        {/* 統計分析頁面 */}
        {activeTab === 'statistics' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">吸菸情形調查統計</h2>
              <p className="text-gray-600">
                以下圖表分析了參與戒菸教育學生的吸菸習慣與態度，可作為後續輔導策略參考。
              </p>
            </div>
            <SurveyCharts data={mockSurveyStats} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; mockStudentRecords = [
  {
    id: 1,
    name: '王小明',
    class: '資工四甲',
    studentId: '1234567',
    instructor: '李教官',
    executionDate: '2024-03-15',
    surveyCompleted: true,
    videosCompleted: true,
    quizCompleted: true,
    essayCompleted: true,
    eventSelected: '114年9月24日',
    totalVideoTime: '12分30秒',
    violations: 2,
    focusPercentage: 85
  },
  {
    id: 2,
    name: '陳美華',
    class: '企管三乙',
    studentId: '2345678',
    instructor: '張教官',
    executionDate: '2024-03-16',
    surveyCompleted: true,
    videosCompleted: true,
    quizCompleted: true,
    essayCompleted: true,
    eventSelected: '114年11月19日',
    totalVideoTime: '15分45秒',
    violations: 0,
    focusPercentage: 98
  },
  {
    id: 3,
    name: '林志強',
    class: '機械二甲',
    studentId: '3456789',
    instructor: '王教官',
    executionDate: '2024-03-17',
    surveyCompleted: true,
    videosCompleted: false,
    quizCompleted: false,
    essayCompleted: false,
    eventSelected: '',
    totalVideoTime: '3分20秒',
    violations: 8,
    focusPercentage: 45
  }
];

const 
 
