// components/PersonalInfoPage.tsx
import React, { useState } from 'react';
import { User } from 'lucide-react';

interface PersonalInfoPageProps {
  onNext: () => void;
  studentData: any;
  setStudentData: (data: any) => void;
}

const PersonalInfoPage: React.FC<PersonalInfoPageProps> = ({ onNext, studentData, setStudentData }) => {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    studentId: '',
    phone: '',
    instructor: '',
    startSmoking: '',
    frequency: '',
    dailyAmount: '',
    reasons: [] as string[],
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

export default PersonalInfoPage; 
