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
import EssayPage from '../components/EssayPage';
import EventSelectionPage from '../components/EventSelectionPage';
import CompletionPage from '../components/CompletionPage';
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
        
        {currentPage === 4 && (
          <EssayPage 
            onNext={nextPage}
            studentData={studentData}
          />
        )}
        
        {currentPage === 5 && (
          <EventSelectionPage 
            onNext={nextPage}
            studentData={studentData}
          />
        )}
        
        {currentPage === 6 && (
          <CompletionPage 
            studentData={studentData}
            selectedDate={selectedDate}
          />
        )}
        
        {/* 開發者快速導航 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 text-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">開發者導航</h3>
              <div className="space-x-2">
                {[1, 2, 3, 4, 5, 6].map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    第{page}頁
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                當前資料: {Object.keys(studentData).length > 0 ? '已填寫' : '未填寫'} | 
                選擇日期: {selectedDate || '未選擇'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmokingCessationApp;
