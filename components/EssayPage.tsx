// components/EssayPage.tsx
import React, { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface EssayPageProps {
  onNext: () => void;
  studentData: any;
}

const EssayPage: React.FC<EssayPageProps> = ({ onNext, studentData }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleComplete = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    setIsCompleted(true);
    setShowConfirmation(false);
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <FileText className="mr-2" /> 戒菸教育心得寫作
      </h2>

      {/* 說明區塊 */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
        <div className="flex">
          <FileText className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">心得寫作要求</h4>
            <div className="text-blue-700 space-y-2">
              <p>📝 請在稿紙上撰寫不少於500字的「菸害教育檢討心得」</p>
              <p>📋 內容應包括以下項目：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>你吸菸的心路歷程</li>
                <li>這次參加戒菸教育的想法與收穫</li>
                <li>對於戒菸教育的建議</li>
                <li>未來的戒菸方向與計畫</li>
              </ul>
              <p>📄 完成後請將心得妥善保管，交給輔導教官審查</p>
            </div>
          </div>
        </div>
      </div>

      {/* 寫作指導 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">寫作指導與範例</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">💡 寫作建議</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 誠實反思自己的吸菸經歷</li>
              <li>• 具體描述觀看影片後的感受</li>
              <li>• 提出實際可行的戒菸計畫</li>
              <li>• 表達對未來健康生活的期許</li>
              <li>• 感謝學校提供的教育機會</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">📖 內容架構建議</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="bg-white p-2 rounded border-l-2 border-blue-300">
                <strong>第一段：</strong>個人吸菸背景與原因
              </div>
              <div className="bg-white p-2 rounded border-l-2 border-green-300">
                <strong>第二段：</strong>參與教育後的反思與收穫
              </div>
              <div className="bg-white p-2 rounded border-l-2 border-orange-300">
                <strong>第三段：</strong>對戒菸教育的看法與建議
              </div>
              <div className="bg-white p-2 rounded border-l-2 border-purple-300">
                <strong>第四段：</strong>未來戒菸計畫與承諾
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 重要提醒 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">重要提醒</h4>
            <div className="text-yellow-700 text-sm mt-1 space-y-1">
              <p>• 心得必須手寫在稿紙上，字數不少於500字</p>
              <p>• 請用正楷書寫，字跡清晰</p>
              <p>• 完成後請妥善保管，勿遺失</p>
              <p>• 需要在下一階段結束前交給輔導教官審查</p>
            </div>
          </div>
        </div>
      </div>

      {/* 學生資訊顯示 */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-700 mb-2">學生資訊</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>姓名：{studentData.name || '___________'}</div>
          <div>班級：{studentData.class || '___________'}</div>
          <div>學號：{studentData.studentId || '___________'}</div>
          <div>輔導教官：{studentData.instructor || '___________'}</div>
        </div>
      </div>

      {/* 完成確認 */}
      <div className="text-center">
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">心得寫作區域</h3>
          <p className="text-gray-500 mb-4">請在實體稿紙上完成您的戒菸教育心得</p>
          <div className="text-sm text-gray-400">
            📝 建議寫作時間：30-45分鐘<br />
            📏 字數要求：不少於500字
          </div>
        </div>

        <button
          onClick={handleComplete}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          我已完成心得寫作 ✓
        </button>
      </div>

      {/* 確認對話框 */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold mb-4 text-gray-800">確認完成</h3>
              <div className="text-gray-600 mb-6 text-left space-y-2">
                <p>請確認您已完成以下事項：</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>在稿紙上手寫完成500字以上的心得</li>
                  <li>內容包含吸菸心路歷程、教育感想、建議及未來計畫</li>
                  <li>字跡清晰，格式正確</li>
                  <li>心得已妥善保管，準備交給輔導教官</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  再檢查一下
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  確認完成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EssayPage; 
