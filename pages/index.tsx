import React, { useState, useEffect } from 'react';
import { User, Clock, CheckCircle, AlertTriangle, FileText, Calendar } from 'lucide-react';

// 防作弊監控 Hook
const useAntiCheatMonitor = () => {
  const [isActive, setIsActive] = useState(true);
  const [violations, setViolations] = useState(0);
  const [violationLogs, setViolationLogs] = useState<string[]>([]);

  useEffect(() => {
    const handleFocus = () => setIsActive(true);
    
    const handleBlur = () => {
      setIsActive(false);
      addViolation('視窗失去焦點');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false);
        addViolation('頁面被隱藏或最小化');
      } else {
        setIsActive(true);
      }
    };

    const handleResize = () => {
      if (window.innerWidth < 800 || window.innerHeight < 600) {
        setIsActive(false);
        addViolation('視窗尺寸過小');
      } else {
        setIsActive(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const addViolation = (reason: string) => {
    setViolations(prev => prev + 1);
    const time = new Date().toLocaleTimeString();
    setViolationLogs(prev => [...prev, `${time}: ${reason}`]);
  };

  return { isActive, violations, violationLogs };
};

// 進度指示組件
const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
    ></div>
    <p className="text-sm text-gray-600 mt-2">步驟 {currentStep} / {totalSteps}</p>
  </div>
);

// 專注度指示器
const FocusIndicator = ({ isActive, violations }: { isActive: boolean, violations: number }) => (
  <div className="fixed top-4 right-4 z-50">
    <div className={`p-3 rounded-lg shadow-lg ${
      isActive ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
    } border-2`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}></div>
        <span className="text-sm font-medium">
          {isActive ? '專心學習中' : '請回到視窗'}
        </span>
      </div>
      {violations > 0 && (
        <div className="text-xs text-gray-600 mt-1">
          違規次數: {violations}/5
        </div>
      )}
    </div>
  </div>
);

// 第一頁：個人資料填寫
const PersonalInfoPage = ({ onNext, studentData, setStudentData }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    studentId: '',
    phone: '',
    instructor: '',
    startSmoking: '',
    frequency: '',
    dailyAmount: '',
    reasons: [],
    familySmoking: '',
    campusAwareness: '',
    signageAwareness: '',
    tobaccoType: '',
    quitAttempts: '',
    quitIntention: '',
    counselingInterest: ''
  });

  const handleReasonChange = (reason: string) => {
    setFormData(prev => ({
      ...prev,
      reasons: prev.reasons.includes(reason) 
        ? prev.reasons.filter(r => r !== reason)
        : [...prev.reasons, reason]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentData(formData);
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">戒菸教育系統</h1>
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <User className="mr-2" /> 個人資料填寫及吸菸狀況調查
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 個人基本資料 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">姓名</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">班級</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.class}
              onChange={(e) => setFormData({...formData, class: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">學號</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.studentId}
              onChange={(e) => setFormData({...formData, studentId: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">手機</label>
            <input
              type="tel"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">輔導教官</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.instructor}
              onChange={(e) => setFormData({...formData, instructor: e.target.value})}
            />
          </div>
        </div>

        {/* 吸菸狀況調查 */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">吸菸狀況調查</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">你從什麼時候開始吸菸？</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['大學以後', '高中階段', '國中階段', '國小階段'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="startSmoking"
                      value={option}
                      required
                      onChange={(e) => setFormData({...formData, startSmoking: e.target.value})}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">你一週吸菸的頻率？</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['每天抽', '1-2天抽1次', '3-4天抽1次', '1週抽1次'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value={option}
                      required
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">你一天吸菸幾支？</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['10支以上', '5-9支', '3-4支', '1-2支'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="dailyAmount"
                      value={option}
                      required
                      onChange={(e) => setFormData({...formData, dailyAmount: e.target.value})}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">你平常吸菸的原因是什麼？（可複選）</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['專心', '放鬆', '習慣', '交際', '打發時間', '其它'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={formData.reasons.includes(option)}
                      onChange={() => handleReasonChange(option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* 其他調查項目 */}
            {[
              { key: 'familySmoking', question: '你家中有人吸菸嗎？', options: ['有', '沒有'] },
              { key: 'campusAwareness', question: '你知道校園全面禁止吸菸嗎？', options: ['知道', '不知道'] },
              { key: 'signageAwareness', question: '你有在學校看過禁菸標示嗎？', options: ['有', '沒有'] },
              { key: 'tobaccoType', question: '你是使用哪種菸品？', options: ['電子煙', '紙煙', '加熱煙'] },
              { key: 'quitAttempts', question: '你有嘗試過戒菸嗎？', options: ['有', '沒有'] },
              { key: 'quitIntention', question: '你現在有戒菸的意願嗎？', options: ['有', '沒有'] },
              { key: 'counselingInterest', question: '政府有提供免費的戒菸輔導，你有興趣瞭解嗎？', options: ['有', '沒有'] }
            ].map(item => (
              <div key={item.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{item.question}</label>
                <div className="flex space-x-4">
                  {item.options.map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name={item.key}
                        value={option}
                        required
                        onChange={(e) => setFormData({...formData, [item.key]: e.target.value})}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          下一步：觀看宣導影片
        </button>
      </form>
    </div>
  );
};

// 第二頁：影片播放
const VideoPage = ({ onNext, studentData }: any) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTimes, setVideoTimes] = useState([0, 0, 0, 0]);
  const [showNext, setShowNext] = useState(false);
  
  const { isActive, violations, violationLogs } = useAntiCheatMonitor();

  const videos = [
    { url: 'https://www.youtube.com/watch?v=z6AR_Rz3PWc', title: '第一部：戒菸的重要性' },
    { url: 'https://www.youtube.com/watch?v=_20zkK8YCps', title: '第二部：菸害對健康的影響' },
    { url: 'https://www.youtube.com/watch?v=iNiGNkuVBOI', title: '第三部：戒菸方法與資源' },
    { url: 'https://www.youtube.com/watch?v=QRKgpii2rDg', title: '第四部：成功戒菸案例' }
  ];

  // 計時器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && isActive) {
      interval = setInterval(() => {
        setPlayTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, isActive]);

  // 當頁面失去焦點時暫停
  useEffect(() => {
    if (!isActive && isPlaying) {
      setIsPlaying(false);
      if (violations <= 5) {
        alert('請保持視窗在前景並維持適當大小以繼續計時');
      }
    }
  }, [isActive, violations]);

  const handlePlay = () => {
    setIsPlaying(true);
    setShowNext(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handleNextVideo = () => {
    // 記錄當前影片觀看時間
    const newVideoTimes = [...videoTimes];
    newVideoTimes[currentVideo] = playTime;
    setVideoTimes(newVideoTimes);
    
    setPlayTime(0);
    setIsPlaying(false);
    setShowNext(false);
    
    if (currentVideo < 3) {
      setCurrentVideo(prev => prev + 1);
    } else {
      // 所有影片播放完畢
      const totalTime = newVideoTimes.reduce((sum, time) => sum + time, 0);
      if (totalTime > 600) { // 假設最少需要10分鐘
        onNext();
      } else {
        alert('請確實觀看所有影片，總觀看時間不足。');
      }
    }
  };

  // 模擬影片播放完成
  useEffect(() => {
    if (playTime > 120) { // 假設每部影片2分鐘
      setIsPlaying(false);
      setShowNext(true);
    }
  }, [playTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <FocusIndicator isActive={isActive} violations={violations} />
      
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Clock className="mr-2" /> 收視戒菸宣導影片
      </h2>
</div>
      <div className="bg-black rounded-lg mb-4" style={{ height: '400px' }}>
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center">
            <h3 className="text-xl mb-4">{videos[currentVideo].title}</h3>
            <p className="mb-4">影片連結: {videos[currentVideo].url}</p>
            <div className="text-6xl mb-4">
              {isPlaying ? '▶️' : '⏸️'}
            </div>
          </div>
        </div>
      </div>

      //{/* 控制按鈕 */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={handlePlay}
          disabled={!isActive || violations > 5}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          播放
        </button>
        
        {showNext && (
          <button
            onClick={handleNextVideo}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
{currentVideo < 3 ? '下一部' : '完成觀看'}
          </button>
        )}
        
        <button
          onClick={handleStop}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          停止
        </button>
      </div>

      {/* 計時器和其他內容 */}
      <div className="text-center mb-4">
        <div className="text-lg font-medium">
          當前影片觀看時間: {formatTime(playTime)}
        </div>
      </div>
    </div>
  );
};

export default SmokingCessationApp;
