// components/QuizPage.tsx
import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';

// 題目與影片映射關係
const questionVideoMapping: Record<number, number> = {
  1: 1,   2: 1,   3: 1,   4: 1,   5: 1,
  6: 2,   7: 2,   8: 2,   9: 2,   10: 2,
  11: 3,  12: 3,  13: 3,  14: 3,  15: 3,
  16: 4,  17: 4,  18: 4,  19: 4,  20: 4
};

// 影片資訊
const videoInfo: Record<number, { id: string; title: string; duration: number }> = {
  1: { id: 'z6AR_Rz3PWc', title: '第一部：戒菸的重要性', duration: 240 },
  2: { id: '_20zkK8YCps', title: '第二部：菸害對健康的影響', duration: 240 },
  3: { id: 'iNiGNkuVBOI', title: '第三部：戒菸方法與資源', duration: 240 },
  4: { id: 'QRKgpii2rDg', title: '第四部：成功戒菸案例', duration: 240 }
};

// 測驗題目
const quizQuestions = [
  // 是非題 (1-10)
  { id: 1, type: 'boolean', question: '電子煙比傳統紙菸更安全，可以幫助戒菸。', answer: false },
  { id: 2, type: 'boolean', question: '二手菸對不吸菸者的健康沒有影響。', answer: false },
  { id: 3, type: 'boolean', question: '菸草中含有超過7000種化學物質。', answer: true },
  { id: 4, type: 'boolean', question: '戒菸後肺功能永遠無法恢復。', answer: false },
  { id: 5, type: 'boolean', question: '校園內全面禁止吸菸。', answer: true },
  { id: 6, type: 'boolean', question: '加熱菸不含尼古丁，比較健康。', answer: false },
  { id: 7, type: 'boolean', question: '孕婦吸菸會影響胎兒健康。', answer: true },
  { id: 8, type: 'boolean', question: '只要意志力強就一定能成功戒菸。', answer: false },
  { id: 9, type: 'boolean', question: '菸害防制法禁止在大專院校內吸菸。', answer: true },
  { id: 10, type: 'boolean', question: '戒菸後體重增加是永久性的。', answer: false },
  
  // 選擇題 (11-20)
  { 
    id: 11, 
    type: 'choice', 
    question: '菸草中最主要的成癮物質是？', 
    options: ['焦油', '尼古丁', '一氧化碳', '甲醛'], 
    answer: 1 
  },
  { 
    id: 12, 
    type: 'choice', 
    question: '戒菸多久後肺功能開始改善？', 
    options: ['1天', '1週', '2週', '1個月'], 
    answer: 2 
  },
  { 
    id: 13, 
    type: 'choice', 
    question: '以下哪種不是政府提供的戒菸資源？', 
    options: ['戒菸專線', '戒菸門診', '戒菸藥物', '電子煙'], 
    answer: 3 
  },
  { 
    id: 14, 
    type: 'choice', 
    question: '菸害防制法規定幾歲以下禁止吸菸？', 
    options: ['16歲', '18歲', '20歲', '21歲'], 
    answer: 1 
  },
  { 
    id: 15, 
    type: 'choice', 
    question: '二手菸中含有多少種致癌物質？', 
    options: ['50種以上', '70種以上', '90種以上', '100種以上'], 
    answer: 1 
  },
  { 
    id: 16, 
    type: 'choice', 
    question: '戒菸後多久心臟病風險會降低一半？', 
    options: ['3個月', '6個月', '1年', '2年'], 
    answer: 2 
  },
  { 
    id: 17, 
    type: 'choice', 
    question: '以下哪個不是吸菸對外貌的影響？', 
    options: ['皮膚老化', '牙齒變黃', '頭髮變白', '口臭'], 
    answer: 2 
  },
  { 
    id: 18, 
    type: 'choice', 
    question: '台灣戒菸專線號碼是？', 
    options: ['0800-636363', '0800-636636', '0800-363636', '0800-366363'], 
    answer: 0 
  },
  { 
    id: 19, 
    type: 'choice', 
    question: '電子煙在台灣的法律地位是？', 
    options: ['合法販售', '全面禁止', '限制販售', '僅限成人'], 
    answer: 1 
  },
  { 
    id: 20, 
    type: 'choice', 
    question: '懷孕期間吸菸最可能導致胎兒？', 
    options: ['體重過重', '體重不足', '身高過高', '頭圍過大'], 
    answer: 1 
  }
];

interface QuizPageProps {
  onNext: () => void;
  onRetry: (wrongQuestions: number[]) => void;
  studentData: any;
  isRetake?: boolean;
  wrongQuestions?: number[];
}

// 重看影片頁面組件
const RetakeVideoPage: React.FC<{
  wrongAnswers: any[];
  videosToRewatch: any[];
  requiredWatchTime: number;
  onRetryQuiz: () => void;
}> = ({ wrongAnswers, videosToRewatch, requiredWatchTime, onRetryQuiz }) => {
  const [watchTime, setWatchTime] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [canRetry, setCanRetry] = useState(false);

  // 開發者模式快速跳過（測試用）
  useEffect(() => {
    window.skipRetakeVideo = () => {
      console.log('開發者模式：跳過重看影片時間限制');
      setWatchTime(requiredWatchTime);
      setCanRetry(true);
      setIsWatching(false);
    };
    
    window.setRetakeWatchTime = (minutes: number) => {
      const seconds = minutes * 60;
      setWatchTime(Math.min(seconds, requiredWatchTime));
      console.log(`開發者模式：設定重看影片時間為 ${minutes} 分鐘`);
      if (seconds >= requiredWatchTime) {
        setCanRetry(true);
        setIsWatching(false);
      }
    };
    
    return () => {
      delete window.skipRetakeVideo;
      delete window.setRetakeWatchTime;
    };
  }, [requiredWatchTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWatching) {
      interval = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          if (newTime >= requiredWatchTime) {
            setCanRetry(true);
            setIsWatching(false);
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isWatching, requiredWatchTime]);

  const startWatching = () => {
    setIsWatching(true);
    setWatchTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6 flex items-center text-orange-600">
        <AlertTriangle className="mr-2" /> 測驗結果與補救學習
      </h2>

      {/* 錯題顯示 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-red-800 mb-3">答錯題目：</h3>
        <div className="space-y-3">
          {wrongAnswers.map((wa, index) => (
            <div key={index} className="border-b border-red-200 pb-2 last:border-b-0">
              <p className="text-red-700 font-medium">第 {wa.questionId} 題：{wa.question}</p>
              <p className="text-red-600 text-sm">題目出處：{videoInfo[wa.videoSource].title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 重看要求 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-3">請重新觀看影片：</h3>
        <p className="text-blue-700 mb-4">
          需要觀看時間：{formatTime(requiredWatchTime)} （原影片時長的一半）
        </p>
        
        {/* 觀看進度 */}
        {(isWatching || watchTime > 0) && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-blue-600 mb-1">
              <span>觀看進度</span>
              <span>{formatTime(watchTime)} / {formatTime(requiredWatchTime)}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((watchTime / requiredWatchTime) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 影片連結 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videosToRewatch.map((video, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
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
              </div>
            </div>
          ))}
        </div>

        {/* 開始觀看按鈕 */}
        {!isWatching && !canRetry && (
          <button
            onClick={startWatching}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            開始重新觀看影片
          </button>
        )}

        {isWatching && (
          <div className="text-center mt-4 text-blue-600 font-medium">
            ⏱️ 正在計時觀看中...
          </div>
        )}

        {/* 開發者測試按鈕 */}
        {process.env.NODE_ENV === 'development' && !canRetry && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <p className="font-medium text-gray-700 mb-2">開發者測試模式：</p>
            <div className="space-x-2">
              <button
                onClick={() => window.skipRetakeVideo?.()}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
              >
                跳過重看時間
              </button>
              <button
                onClick={() => window.setRetakeWatchTime?.(2)}
                className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
              >
                設定已觀看2分鐘
              </button>
            </div>
            <p className="text-gray-500 mt-1">
              控制台指令：window.skipRetakeVideo() 或 window.setRetakeWatchTime(分鐘)
            </p>
          </div>
        )}
      </div>

      {/* 重新作答按鈕 */}
      <div className="text-center">
        <button
          onClick={onRetryQuiz}
          disabled={!canRetry}
          className={`px-8 py-3 rounded-lg font-medium ${
            canRetry
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canRetry ? '重新作答錯題' : `請先觀看影片 ${formatTime(requiredWatchTime - watchTime)}`}
        </button>
      </div>
    </div>
  );

      {/* 重新作答按鈕 */}
      <div className="text-center">
        <button
          onClick={onRetryQuiz}
          disabled={!canRetry}
          className={`px-8 py-3 rounded-lg font-medium ${
            canRetry
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canRetry ? '重新作答錯題' : `請先觀看影片 ${formatTime(requiredWatchTime - watchTime)}`}
        </button>
      </div>
    </div>
  );
};

      {/* 重新作答按鈕 */}
      <div className="text-center">
        <button
          onClick={onRetryQuiz}
          disabled={!canRetry}
          className={`px-8 py-3 rounded-lg font-medium ${
            canRetry
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canRetry ? '重新作答錯題' : `請先觀看影片 ${formatTime(requiredWatchTime - watchTime)}`}
        </button>
      </div>
    </div>
  );
};

// 主測驗頁面組件
const QuizPage: React.FC<QuizPageProps> = ({ 
  onNext, 
  onRetry, 
  studentData, 
  isRetake = false, 
  wrongQuestions = [] 
}) => {
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  // 決定要顯示的題目
  const questionsToShow = isRetake 
    ? quizQuestions.filter(q => wrongQuestions.includes(q.id))
    : quizQuestions;

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    const results = questionsToShow.map(question => {
      const userAnswer = answers[question.id];
      const isCorrect = question.type === 'boolean' 
        ? userAnswer === question.answer
        : userAnswer === question.answer;
      
      return {
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.answer,
        isCorrect,
        videoSource: questionVideoMapping[question.id]
      };
    });

    const wrongAnswers = results.filter(r => !r.isCorrect);
    const allCorrect = wrongAnswers.length === 0;

    setQuizResults({
      results,
      wrongAnswers,
      allCorrect,
      score: results.filter(r => r.isCorrect).length,
      total: results.length
    });

    setShowResults(true);

    if (allCorrect) {
      // 全部答對，進入下一階段
      setTimeout(() => onNext(), 2000);
    }
  };

  // 取得需要重看的影片
  const getVideosToRewatch = (wrongAnswers: any[]) => {
    const videoSources = wrongAnswers.map((wa: any) => wa.videoSource);
    const uniqueVideoNumbers = videoSources.filter((value, index, self) => self.indexOf(value) === index);
    return uniqueVideoNumbers.map(num => videoInfo[num]);
  };

  if (showResults && !quizResults.allCorrect) {
    const videosToRewatch = getVideosToRewatch(quizResults.wrongAnswers);
    const requiredWatchTime = Math.floor(videosToRewatch.reduce((sum: number, video: any) => sum + video.duration, 0) / 2);

    return (
      <RetakeVideoPage 
        wrongAnswers={quizResults.wrongAnswers}
        videosToRewatch={videosToRewatch}
        requiredWatchTime={requiredWatchTime}
        onRetryQuiz={() => onRetry(quizResults.wrongAnswers.map((wa: any) => wa.questionId))}
      />
    );
  }

  if (showResults && quizResults.allCorrect) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-green-600 mb-4">測驗通過！</h2>
        <p className="text-lg mb-6">
          恭喜您完成戒菸常識測驗！得分：{quizResults.score}/{quizResults.total}
        </p>
        <p className="text-gray-600">正在進入下一階段...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <FileText className="mr-2" /> 戒菸常識測驗
        {isRetake && <span className="ml-2 text-orange-600">（重新作答）</span>}
      </h2>

      {isRetake && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-orange-400 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800">重新作答</h4>
              <p className="text-orange-700 text-sm mt-1">
                請針對之前答錯的題目重新作答，全部答對後才能進入下一階段。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {questionsToShow.map((question) => (
          <div key={question.id} className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">
              第 {question.id} 題：{question.question}
            </h3>

            {question.type === 'boolean' ? (
              <div className="space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="true"
                    onChange={() => handleAnswerChange(question.id, true)}
                    className="mr-2"
                  />
                  正確
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="false"
                    onChange={() => handleAnswerChange(question.id, false)}
                    className="mr-2"
                  />
                  錯誤
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                {question.options?.map((option: string, optionIndex: number) => (
                  <label key={optionIndex} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={optionIndex}
                      onChange={() => handleAnswerChange(question.id, optionIndex)}
                      className="mr-2"
                    />
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== questionsToShow.length}
          className={`px-8 py-3 rounded-lg font-medium ${
            Object.keys(answers).length === questionsToShow.length
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          送出評分
        </button>
        
        {Object.keys(answers).length !== questionsToShow.length && (
          <p className="text-gray-500 text-sm mt-2">
            請回答所有題目後再送出
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
