// pages/index.tsx
declare global {
  interface Window {
    skipToNext: () => void;
    setWatchTime: (minutes: number) => void;
    addWatchTime: (minutes: number) => void;
  }
}

import React, { useState } from 'react';
import PersonalInfoPage from '../components/PersonalInfoPage';
import VideoPage from '../components/VideoPage';
import QuizPage from '../components/QuizPage';
import ProgressIndicator from '../components/ProgressIndicator';

// 主應用程式
const SmokingCessationApp = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [studentData, setStudentData] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [isQuizRetake, setIsQuizRetake] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState<number[]>([]);

  const nextPage = (data?: any) => {
    if (data) {
      setSelectedDate(data);
    }
    setCurrentPage(prev => prev + 1);
    setIsQuizRetake(false); // 重置重考狀態
  };

  const handleQuizRetry = (wrongQuestionIds: number[]) => {
    setWrongQuestions(wrongQuestionIds);
    setIsQuizRetake(true);
    // 不改變 currentPage，保持在測驗頁面
  };

  const totalPages = 6;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        <ProgressIndicator currentStep={currentPage} totalSteps={totalPages} />
        
        {currentPage === 1 && (
          <PersonalInfoPage 
            onNext={nextPage} 
            studentData={studentData} 
            setStudentData={setStudentData} 
          />
        )}
        
        {currentPage === 2 && (
          <VideoPage onNext={nextPage} studentData={studentData} />
        )}
        
        {currentPage === 3 && (
          <QuizPage 
            onNext={nextPage} 
            onRetry={handleQuizRetry}
            studentData={studentData}
            isRetake={isQuizRetake}
            wrongQuestions={wrongQuestions}
          />
        )}
        
        {/* 其他頁面可以稍後添加 */}
        {currentPage > 3 && (
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">功能開發中</h2>
            <p className="text-gray-600">第 {currentPage} 頁功能將陸續開放</p>
            
            {/* 開發者快速導航 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 space-x-2">
                {[1, 2, 3, 4, 5, 6].map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    第{page}頁
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmokingCessationApp;
