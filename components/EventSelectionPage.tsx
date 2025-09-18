// components/EventSelectionPage.tsx
import React, { useState } from 'react';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

interface EventSelectionPageProps {
  onNext: (selectedDate: string) => void;
  studentData: any;
}

const EventSelectionPage: React.FC<EventSelectionPageProps> = ({ onNext, studentData }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const eventDates = [
    {
      id: '2024-09-24',
      date: '114年9月24日',
      dayOfWeek: '(星期二)',
      time: '下午2:00-4:00',
      location: '學生活動中心大禮堂'
    },
    {
      id: '2024-11-19',
      date: '114年11月19日',
      dayOfWeek: '(星期二)',
      time: '下午2:00-4:00',
      location: '學生活動中心大禮堂'
    }
  ];

  const handleDateSelect = (dateId: string) => {
    setSelectedDate(dateId);
  };

  const handleSubmit = () => {
    if (selectedDate) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    const selectedEvent = eventDates.find(event => event.id === selectedDate);
    onNext(selectedEvent?.date || selectedDate);
  };

  const getSelectedEventInfo = () => {
    return eventDates.find(event => event.id === selectedDate);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Calendar className="mr-2" /> 選擇戒菸宣導場次
      </h2>

      {/* 重要說明 */}
      <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-6">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800 mb-2">重要通知</h4>
            <div className="text-red-700 space-y-2">
              <p>📢 依本校學生「戒菸輔導教育執行作法」，您需要參加本校辦理的「反毒暨菸害防制教育宣導」活動。</p>
              <p>⚠️ <strong>請您選擇一場，並務必記得參加。</strong></p>
              <p>🚫 <strong>未參加者視同未完成戒菸教育，將依校規處分。</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* 活動場次選擇 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">辦理日期如下：</h3>
        
        <div className="space-y-4">
          {eventDates.map((event, index) => (
            <div
              key={event.id}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedDate === event.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleDateSelect(event.id)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  id={event.id}
                  name="eventDate"
                  value={event.id}
                  checked={selectedDate === event.id}
                  onChange={() => handleDateSelect(event.id)}
                  className="mr-4 h-5 w-5 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">
                      場次 {index + 1}：{event.date} {event.dayOfWeek}
                    </h4>
                    {selectedDate === event.id && (
                      <CheckCircle className="ml-2 h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="text-gray-600 space-y-1">
                    <p>🕐 時間：{event.time}</p>
                    <p>📍 地點：{event.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 活動內容說明 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">活動內容</h4>
        <div className="text-gray-600 space-y-2">
          <p>🎯 反毒暨菸害防制教育專題演講</p>
          <p>👨‍⚕️ 專業醫師或心理師主講</p>
          <p>📊 戒菸成功案例分享</p>
          <p>🤝 戒菸資源介紹與諮詢</p>
          <p>📝 現場簽到確認出席</p>
        </div>
      </div>

      {/* 選擇確認 */}
      {selectedDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-800 mb-2">您的選擇</h4>
          <div className="text-blue-700">
            <p>📅 選擇場次：{getSelectedEventInfo()?.date}</p>
            <p>🕐 活動時間：{getSelectedEventInfo()?.time}</p>
            <p>📍 活動地點：{getSelectedEventInfo()?.location}</p>
          </div>
        </div>
      )}

      {/* 提交按鈕 */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedDate}
          className={`px-8 py-3 rounded-lg font-medium transition-all ${
            selectedDate
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          確認選擇並完成報名
        </button>
        
        {!selectedDate && (
          <p className="text-gray-500 text-sm mt-2">
            請先選擇一個參加場次
          </p>
        )}
      </div>

      {/* 確認對話框 */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-4 text-gray-800">確認參加場次</h3>
              <div className="text-gray-600 mb-6">
                <p className="mb-2">您選擇的反毒暨菸害防制教育宣導活動是：</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-blue-800">
                    {getSelectedEventInfo()?.date}
                  </p>
                  <p className="text-blue-600 text-sm">
                    {getSelectedEventInfo()?.time}<br />
                    {getSelectedEventInfo()?.location}
                  </p>
                </div>
                <p className="mt-4 text-sm text-red-600 font-medium">
                  ⚠️ 請務必記得參加，未參加將依校規處分！
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  重新選擇
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  確認參加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventSelectionPage; 
