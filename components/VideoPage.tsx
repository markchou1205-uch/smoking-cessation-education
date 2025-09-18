// components/VideoPage.tsx
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface VideoPageProps {
  onNext: () => void;
  studentData: any;
}

const VideoPage: React.FC<VideoPageProps> = ({ onNext, studentData }) => {
  const [showModal, setShowModal] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  
  const videos = [
    { id: 'z6AR_Rz3PWc', title: '第一部：戒菸的重要性', duration: 240 }, // 4分鐘
    { id: '_20zkK8YCps', title: '第二部：菸害對健康的影響', duration: 240 }, // 4分鐘
    { id: 'iNiGNkuVBOI', title: '第三部：戒菸方法與資源', duration: 240 }, // 4分鐘
    { id: 'QRKgpii2rDg', title: '第四部：成功戒菸案例', duration: 240 } // 4分鐘
  ];
  
  const totalRequiredTime = videos.reduce((sum, video) => sum + video.duration, 0); // 16分鐘

  // 開發者模式快速跳過（測試用）
  useEffect(() => {
    window.skipToNext = () => {
      console.log('開發者模式：跳過影片觀看時間限制');
      onNext();
    };
    
    window.setWatchTime = (minutes: number) => {
      const seconds = minutes * 60;
      setTotalWatchTime(seconds);
      console.log(`開發者模式：設定觀看時間為 ${minutes} 分鐘`);
    };
    
    return () => {
      delete window.skipToNext;
      delete window.setWatchTime;
    };
  }, [onNext]);

  // 確認按鈕處理
  const handleModalConfirm = () => {
    setShowModal(false);
    setCountdown(3);
    
    // 3秒倒數
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsTimerActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 主計時器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive) {
      interval = setInterval(() => {
        setTotalWatchTime(prev => {
          const newTime = prev + 1;
          if (newTime >= totalRequiredTime) {
            setCanProceed(true);
            setIsTimerActive(false);
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, totalRequiredTime]);

  // 格式化時間顯示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Modal 提示 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">戒菸教育影片觀看須知</h3>
            <div className="space-y-3 text-gray-700">
              <p>📺 現在請收視戒菸宣教影片，影片共有4部</p>
              <p>❓ 下一階段將會請你回答有關4部影片的問題</p>
              <p>👀 請專心收視所有影片內容</p>
              <p>⏱️ 系統將計時 {formatTime(totalRequiredTime)}，時間到達後才能進入測驗階段</p>
            </div>
            <button
              onClick={handleModalConfirm}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              確認開始觀看
            </button>
          </div>
        </div>
      )}

      {/* 倒數顯示 */}
      {countdown > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-white text-6xl font-bold">
            {countdown}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Clock className="mr-2" /> 收視戒菸宣導影片
      </h2>

      {/* 計時器顯示 */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">觀看進度</h3>
            <p className="text-gray-600">
              已觀看：{formatTime(totalWatchTime)} / {formatTime(totalRequiredTime)}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${canProceed ? 'text-green-600' : 'text-blue-600'}`}>
              {canProceed ? '✅ 完成!' : '⏱️ 計時中...'}
            </div>
          </div>
        </div>
        
        {/* 進度條 */}
        <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-1000" 
            style={{ width: `${Math.min((totalWatchTime / totalRequiredTime) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* 影片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {videos.map((video, index) => (
          <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${video.id}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="p-3">
              <h4 className="font-medium text-sm">{video.title}</h4>
              <p className="text-xs text-gray-500">建議觀看時長：{formatTime(video.duration)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 說明文字 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">重要提醒</h4>
            <p className="text-yellow-700 text-sm mt-1">
              請確實觀看所有影片內容，接下來的測驗將基於這些影片出題。
              如果測驗答錯，您需要重新觀看相關影片並重新作答。
            </p>
          </div>
        </div>
      </div>

      {/* 下一步按鈕 */}
      <div className="text-center">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-lg font-medium transition-all ${
            canProceed 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canProceed ? '進入戒菸常識測驗' : `請等待 ${formatTime(totalRequiredTime - totalWatchTime)}`}
        </button>
      </div>

      {/* 開發者資訊（可選） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <p>開發者模式：</p>
          <p>• window.skipToNext() - 跳過時間限制</p>
          <p>• window.setWatchTime(分鐘) - 設定觀看時間</p>
        </div>
      )}
    </div>
  );
};

export default VideoPage; 
