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

  const [errors, setErrors] = useState({
    phone: '',
    studentId: '',
    instructor: ''
  });

  // 輔導教官選項
  const instructorOptions = [
    '郭威均教官',
    '陳鈴玉教官',
    '許順益教官',
    '陳震宇教官',
    '周增明教官',
    '林雅月教官',
    '鄧建鑫教官',
    '邱信國教官',
    '林政益教官(進)',
    '温榮星教官(進)',
    '王仁柏教官(進)'
  ];

  // 驗證手機號碼（10碼數字）
  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return '手機號碼必須為10碼數字';
    }
    return '';
  };

  // 驗證學號（第1碼英文字母，後8碼數字）
  const validateStudentId = (studentId: string) => {
    const studentIdRegex = /^[A-Za-z]\d{8}$/;
    if (!studentIdRegex.test(studentId)) {
      return '學號必須為9碼，第1碼為英文字母，後8碼為數字';
    }
    return '';
  };

  // 處理輸入變更
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 即時驗證
    if (field === 'phone') {
      setErrors(prev => ({
        ...prev,
        phone: validatePhone(value)
      }));
    } else if (field === 'studentId') {
      setErrors(prev => ({
        ...prev,
        studentId: validateStudentId(value)
      }));
    } else if (field === 'instructor') {
      setErrors(prev => ({
        ...prev,
        instructor: value ? '' : '請選擇輔導教官'
      }));
    }
  };

  const handleReasonChange = (reason: string) => {
    setFormData(prev => ({
      ...prev,
      reasons: prev.reasons.includes(reason) 
        ? prev.reasons.filter(r => r !== reason)
        : [...prev.reasons, reason]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證所有必填欄位
    const phoneError = validatePhone(formData.phone);
    const studentIdError = validateStudentId(formData.studentId);
    const instructorError = !formData.instructor ? '請選擇輔導教官' : '';

    setErrors({
      phone: phoneError,
      studentId: studentIdError,
      instructor: instructorError
    });

    // 如果有錯誤，停止提交
    if (phoneError || studentIdError || instructorError) {
      alert('請修正表單錯誤後再提交');
      return;
    }

    try {
      // 發送資料到後台
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          completedDate: new Date().toISOString(),
          status: 'in_progress'
        }),
      });

      if (!response.ok) {
        throw new Error('提交失敗');
      }

      const result = await response.json();
      console.log('資料提交成功:', result);

      // 設定本地狀態並進入下一步
      setStudentData(formData);
      onNext();
    } catch (error) {
      console.error('提交錯誤:', error);
      alert('資料提交失敗，請稍後再試');
    }
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
            <label className="block text-sm font-medium text-gray-700">姓名 *</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">班級 *</label>
            <input
              type="text"
              required
              placeholder="例：資工系二甲"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.class}
              onChange={(e) => handleInputChange('class', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">學號 *</label>
            <input
              type="text"
              required
              placeholder="例：A123456789"
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                errors.studentId ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.studentId}
              onChange={(e) => handleInputChange('studentId', e.target.value.toUpperCase())}
              maxLength={9}
            />
            {errors.studentId && (
              <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">手機 *</label>
            <input
              type="tel"
              required
              placeholder="例：0912345678"
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
              maxLength={10}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">輔導教官 *</label>
            <select
              required
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                errors.instructor ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.instructor}
              onChange={(e) => handleInputChange('instructor', e.target.value)}
            >
              <option value="">請選擇輔導教官</option>
              {instructorOptions.map((instructor, index) => (
                <option key={index} value={instructor}>
                  {instructor}
                </option>
              ))}
            </select>
            {errors.instructor && (
              <p className="mt-1 text-sm text-red-600">{errors.instructor}</p>
            )}
          </div>
        </div>

        {/* 吸菸狀況調查 */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">吸菸狀況調查</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">你從什麼時候開始吸菸？ *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['大學以後', '高中階段', '國中階段', '國小階段'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="startSmoking"
                      value={option}
                      required
                      onChange={(e) => handleInputChange('startSmoking', e.target.value)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">你一週吸菸的頻率？ *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['每天抽', '1-2天抽1次', '3-4天抽1次', '1週抽1次'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value={option}
                      required
                      onChange={(e) => handleInputChange('frequency', e.target.value)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">你一天吸菸幾支？ *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['10支以上', '5-9支', '3-4支', '1-2支'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="dailyAmount"
                      value={option}
                      required
                      onChange={(e) => handleInputChange('dailyAmount', e.target.value)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">你平常吸菸的原因是什麼？（可複選）*</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{item.question} *</label>
                <div className="flex space-x-4">
                  {item.options.map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name={item.key}
                        value={option}
                        required
                        onChange={(e) => handleInputChange(item.key, e.target.value)}
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
