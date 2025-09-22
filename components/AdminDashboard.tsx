// components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar as RechartsBar, 
  XAxis as RechartsXAxis, 
  YAxis as RechartsYAxis, 
  CartesianGrid as RechartsCartesianGrid, 
  Tooltip as RechartsTooltip, 
  PieChart as RechartsPieChart, 
  Pie as RechartsPie, 
  Cell as RechartsCell, 
  ResponsiveContainer as RechartsResponsiveContainer 
} from 'recharts';
import { 
  Users as LucideUsers, 
  FileText as LucideFileText, 
  Video as LucideVideo, 
  CheckCircle as LucideCheckCircle, 
  AlertTriangle as LucideAlertTriangle, 
  Download as LucideDownload, 
  Search as LucideSearch, 
  RefreshCw as LucideRefreshCw,
  BarChart3 as LucideBarChart3
} from 'lucide-react';

interface AdminDashboardProps {
  // 組件不需要特殊的props
}

interface StudentRecord {
  id: string;
  name: string;
  class: string;
  studentId: string;
  phone: string;
  instructor: string;
  startSmoking?: string;
  frequency?: string;
  dailyAmount?: string;
  reasons?: string[];
  familySmoking?: string;
  campusAwareness?: string;
  signageAwareness?: string;
  tobaccoType?: string;
  quitAttempts?: string;
  quitIntention?: string;
  counselingInterest?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Statistics {
  totalStudents: number;
  completedStudents: number;
  completionRate: number;
  startSmokingStats: { name: string; value: number }[];
  frequencyStats: { name: string; value: number }[];
  dailyAmountStats: { name: string; value: number }[];
  reasonsStats: { name: string; value: number }[];
  tobaccoTypeStats: { name: string; value: number }[];
  quitIntentionStats: { name: string; value: number }[];
  instructorStats: { name: string; value: number }[];
  classStats: { name: string; value: number }[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [studentRecords, setStudentRecords] = useState<StudentRecord[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedInstructor, setSelectedInstructor] = useState('all');
  const [activeTab, setActiveTab] = useState<'records' | 'statistics'>('records');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fromDate, setFromDate] = useState(ymdNDaysAgo(30));
  const [toDate, setToDate]     = useState(todayYMD());
 
   // 小工具：把陣列依 key 彙整計數
   const tally = (arr: (string|undefined|null)[])=>{
     const map = new Map<string, number>();
     for (const v of arr) if (v) map.set(v, (map.get(v)||0)+1);
     return Array.from(map.entries()).map(([name,value])=>({name, value}));
   };
  // === 日期工具 ===
const pad = (n: number) => String(n).padStart(2, "0");
const todayYMD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const ymdNDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const startOfDay = (ymd: string) => new Date(`${ymd}T00:00:00`);
const endOfDay   = (ymd: string) => new Date(`${ymd}T23:59:59.999`);

   // 由學生紀錄「依日期區間」計算統計
   const computeStatistics = (records: StudentRecord[]): Statistics => {
     const from = startOfDay(fromDate).getTime();
     const to   = endOfDay(toDate).getTime();
     const inRange = records.filter(r=>{
       const t = r.createdAt ? new Date(r.createdAt).getTime() : NaN;
       return Number.isFinite(t) && t >= from && t <= to;
     });
     const totalStudents = inRange.length;
     const completedStudents = inRange.filter(r=>r.status==='completed').length;
     const completionRate = totalStudents ? Math.round((completedStudents/totalStudents)*100) : 0;
     // 單值欄位直接彙整
     const startSmokingStats  = tally(inRange.map(r=>r.startSmoking));
     const frequencyStats     = tally(inRange.map(r=>r.frequency));
     const dailyAmountStats   = tally(inRange.map(r=>r.dailyAmount));
     const tobaccoTypeStats   = tally(inRange.map(r=>r.tobaccoType));
     const quitIntentionStats = tally(inRange.map(r=>r.quitIntention));
     const instructorStats    = tally(inRange.map(r=>r.instructor));
     // 班級可依你現有顯示邏輯截取到「xx系」
     const classStats         = tally(inRange.map(r=> r.class ? (r.class.split('系')[0]   '系') : r.class));
     // 多選「原因」需要攤平
     const reasonsStatsMap = new Map<string, number>();
     for (const r of inRange) {
       if (Array.isArray(r.reasons)) {
         for (const reason of r.reasons) {
           if (!reason) continue;
           reasonsStatsMap.set(reason, (reasonsStatsMap.get(reason)||0)+1);
         }
       }
     }
     const reasonsStats = Array.from(reasonsStatsMap.entries()).map(([name,value])=>({name,value}));
     return {
       totalStudents, completedStudents, completionRate,
       startSmokingStats, frequencyStats, dailyAmountStats, reasonsStats,
       tobaccoTypeStats, quitIntentionStats, instructorStats, classStats
     };
   };

  // 載入資料
  const loadData = async () => {
    setLoading(true);
    try {
       const recordsResponse = await fetch('/api/students');
       if (recordsResponse.ok) {
         const recordsData = await recordsResponse.json();
         const list: StudentRecord[] = recordsData.data || [];
         setStudentRecords(list);
         // 以目前的日期區間計算真統計
         setStatistics(computeStatistics(list));
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
   // 日期區間或原始資料變更 → 重新計算統計
   useEffect(() => {
     if (studentRecords.length) {
       setStatistics(computeStatistics(studentRecords));
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [fromDate, toDate, studentRecords]);
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
      .map(r => r.class?.split('系')[0]   '系')
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

    const blob = new Blob(['\uFEFF'   csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `戒菸教育記錄_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <LucideRefreshCw className="h-6 w-6 animate-spin text-blue-600" />
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
              <LucideRefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              重新載入
            </button>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <LucideUsers className="h-8 w-8 text-blue-600" />
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
              <LucideCheckCircle className="h-8 w-8 text-green-600" />
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
              <LucideVideo className="h-8 w-8 text-purple-600" />
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
              <LucideFileText className="h-8 w-8 text-orange-600" />
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
                <LucideFileText className="inline-block w-4 h-4 mr-2" />
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
                <LucideBarChart3 className="inline-block w-4 h-4 mr-2" />
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
                    <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                  <LucideDownload className="h-4 w-4 mr-2" />
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
                             {/* 新增：區間選擇器 */}
               <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6">
                 <div>
                   <label className="block text-sm mb-1">起始日期</label>
                   <input type="date" value={fromDate} max={toDate}
                          onChange={(e)=>setFromDate(e.target.value)}
                          className="border rounded px-3 py-2"/>
                 </div>
                 <div>
                   <label className="block text-sm mb-1">結束日期</label>
                   <input type="date" value={toDate}
                          min={fromDate} max={todayYMD()}
                          onChange={(e)=>setToDate(e.target.value)}
                          className="border rounded px-3 py-2"/>
                 </div>
                 <button onClick={()=>setStatistics(computeStatistics(studentRecords))}
                         className="h-10 px-4 rounded bg-black text-white">
                   套用
                 </button>
                 <div className="flex gap-2 md:ml-auto">
                   <button className="h-10 px-3 border rounded"
                           onClick={()=>{setFromDate(ymdNDaysAgo(7)); setToDate(todayYMD());}}>
                     近7天
                   </button>
                   <button className="h-10 px-3 border rounded"
                           onClick={()=>{setFromDate(ymdNDaysAgo(30)); setToDate(todayYMD());}}>
                     近30天
                   </button>
                   <button className="h-10 px-3 border rounded"
                           onClick={()=>{setFromDate(ymdNDaysAgo(90)); setToDate(todayYMD());}}>
                     近90天
                   </button>
                 </div>
               </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 開始吸菸年齡統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">開始吸菸年齡分布</h3>
                  <RechartsResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={statistics.startSmokingStats}>
                      <RechartsCartesianGrid strokeDasharray="3 3" />
                      <RechartsXAxis dataKey="name" />
                      <RechartsYAxis />
                      <RechartsTooltip />
                      <RechartsBar dataKey="value" fill="#8884d8" />
                    </RechartsBarChart>
                  </RechartsResponsiveContainer>
                </div>

                {/* 吸菸頻率統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">吸菸頻率分布</h3>
                  <RechartsResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <RechartsPie
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
                          <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </RechartsPie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </RechartsResponsiveContainer>
                </div>

                {/* 每日吸菸量統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">每日吸菸量分布</h3>
                  <RechartsResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={statistics.dailyAmountStats}>
                      <RechartsCartesianGrid strokeDasharray="3 3" />
                      <RechartsXAxis dataKey="name" />
                      <RechartsYAxis />
                      <RechartsTooltip />
                      <RechartsBar dataKey="value" fill="#82ca9d" />
                    </RechartsBarChart>
                  </RechartsResponsiveContainer>
                </div>

                {/* 吸菸原因統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">吸菸原因統計</h3>
                  <RechartsResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={statistics.reasonsStats} layout="horizontal">
                      <RechartsCartesianGrid strokeDasharray="3 3" />
                      <RechartsXAxis type="number" />
                      <RechartsYAxis dataKey="name" type="category" width={60} />
                      <RechartsTooltip />
                      <RechartsBar dataKey="value" fill="#ffc658" />
                    </RechartsBarChart>
                  </RechartsResponsiveContainer>
                </div>

                {/* 菸品類型統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">菸品類型分布</h3>
                  <RechartsResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <RechartsPie
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
                          <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </RechartsPie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </RechartsResponsiveContainer>
                </div>

                {/* 戒菸意願統計 */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">戒菸意願分布</h3>
                  <RechartsResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <RechartsPie
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
                          <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </RechartsPie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </RechartsResponsiveContainer>
                </div>

                {/* 輔導教官統計 */}
                {statistics.instructorStats && statistics.instructorStats.length > 0 && (
                  <div className="bg-white p-6 rounded-lg border lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">輔導教官分佈</h3>
                    <RechartsResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={statistics.instructorStats}>
                        <RechartsCartesianGrid strokeDasharray="3 3" />
                        <RechartsXAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <RechartsYAxis />
                        <RechartsTooltip />
                        <RechartsBar dataKey="value" fill="#ff7c7c" />
                      </RechartsBarChart>
                    </RechartsResponsiveContainer>
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

export default AdminDashboard;
