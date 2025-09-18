// components/CompletionPage.tsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, FileText, User } from 'lucide-react';

interface CompletionPageProps {
  studentData: any;
  selectedDate: string;
}

const CompletionPage: React.FC<CompletionPageProps> = ({ studentData, selectedDate }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // 設定當前日期
    const now = new Date();
    const year = now.getFullYear() - 1911; // 民國年
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setCurrentDate(`${year}年${month}月${day}日`);
    
    // 延遲顯示成功訊息
    setTimeout(() => setShowSuccess(true), 500);
  }, []);

  const generatePDF = () => {
    // 這裡實際應該調用 PDF 生成函數
    // 暫時用 alert 模擬
    alert('PDF 生成功能開發中...\n\n實際部署時會自動生成「戒菸教育執行記錄表」PDF檔案');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* 成功提示 */}
      {showSuccess && (
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold text-green-600 mb-2">戒菸教育完成！</h1>
          <p className="text-gray-600">您已成功完成所有戒菸教育流程</p>
        </div>
      )}

      {/* 提示訊息 */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
        <div className="flex">
          <FileText className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">系統通知</h4>
            <p className="text-blue-700">
              戒菸教育執行記錄表已完成，請列印後併同戒菸教育心得一同交給輔導教官。
            </p>
          </div>
        </div>
      </div>

      {/* PDF 記錄表內容 */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-8 mb-6" id="record-form">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">健行科技大學戒菸教育執行記錄表</h2>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* 學生基本資料 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <span className="font-medium text-gray-700 w-20">學生姓名：</span>
            <span className="border-b border-gray-400 flex-1 pb-1">{studentData.name || '___________'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 w-16">班級：</span>
            <span className="border-b border-gray-400 flex-1 pb-1">{studentData.class || '___________'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 w-16">學號：</span>
            <span className="border-b border-gray-400 flex-1 pb-1">{studentData.studentId || '___________'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 w-24">執行日期：</span>
            <span className="border-b border-gray-400 flex-1 pb-1">{currentDate}</span>
          </div>
        </div>

        <div className="flex items-center mb-6">
          <span className="font-medium text-gray-700 w-16">地點：</span>
          <span className="border-b border-gray-400 flex-1 pb-1">軍訓室</span>
        </div>

        {/* 執行項目 */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">執行項目：</h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-center">
              <span className="font-medium w-4">一、</span>
              <span>完成吸菸情形調查。</span>
              <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center">
              <span className="font-medium w-4">二、</span>
              <span>完成反菸宣導影片收視：共16分0秒。</span>
              <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center">
              <span className="font-medium w-4">三、</span>
              <span>完成反菸知識作答，並全數通過。</span>
              <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center">
              <span className="font-medium w-4">四、</span>
              <span>完成戒菸教育心得寫作500字，並交給輔導教官。</span>
              <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center mb-4">
              <span className="font-medium w-16">輔導教官簽名：</span>
              <span className="border-b border-gray-400 w-40 pb-1"></span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-4">五、</span>
              <span>完成菸害宣導參與場次勾選：</span>
              <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center ml-8">
              <span className="font-medium w-20">選擇場次：</span>
              <span className="border-b border-gray-400 flex-1 pb-1 max-w-xs">{selectedDate || '___________'}</span>
            </div>
          </div>
        </div>

        {/* 法律聲明 */}
        <div className="mb-6">
          <div className="flex items-start">
            <span className="font-medium w-4 text-gray-700">六、</span>
            <span className="text-gray-700">
              我知悉如果沒有參與指定日期的菸害宣導，將視同沒有完成戒菸教育，
              除了將依校規處分，學校也會依菸害防制法移送裁罰。
            </span>
          </div>
          <div className="flex items-center mt-4 ml-8">
            <span className="font-medium w-20 text-gray-700">學生簽名：</span>
            <span className="border-b border-gray-400 w-40 pb-1"></span>
          </div>
        </div>

        {/* 日期與校章 */}
        <div className="flex justify-between items-end mt-8">
          <div className="text-gray-600">
            <p>製表日期：{currentDate}</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 border-2 border-gray-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-500">春暉承辦人蓋章</span>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={generatePDF}
          className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="mr-2 h-5 w-5" />
          下載 PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FileText className="mr-2 h-5 w-5" />
          列印記錄表
        </button>
      </div>

      {/* 最終提醒 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex">
          <User className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">接下來請務必完成</h4>
            <div className="text-yellow-700 space-y-2">
              <p>📄 列印本記錄表，交給輔導教官簽名</p>
              <p>📝 將手寫心得一併交給輔導教官審查</p>
              <p>📅 記住您選擇的宣導活動日期：<strong>{selectedDate}</strong></p>
              <p>⚠️ 務必準時參加宣導活動，完成所有戒菸教育流程</p>
            </div>
          </div>
        </div>
      </div>

      {/* 完成統計 */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">戒菸教育完成統計</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">✓</div>
            <div className="text-sm text-gray-600">資料填寫</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">16:00</div>
            <div className="text-sm text-gray-600">影片觀看</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">20/20</div>
            <div className="text-sm text-gray-600">測驗通過</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600">500+</div>
            <div className="text-sm text-gray-600">心得字數</div>
          </div>
        </div>
      </div>

      {/* 感謝訊息 */}
      <div className="text-center mt-8 text-gray-600">
        <p>恭喜您完成健行科技大學戒菸教育課程</p>
        <p className="text-sm mt-2">祝您健康快樂，遠離菸害！</p>
      </div>
    </div>
  );
};

export default CompletionPage; 
