// pages/api/admin/statistics.ts
import { NextApiRequest, NextApiResponse } from 'next';

// 這裡應該導入實際的資料庫查詢函數
// 暫時使用模擬資料
let studentsData: any[] = [];

// 統計數據生成函數
function generateStatistics(records: any[]) {
  if (records.length === 0) {
    return {
      totalStudents: 0,
      completedStudents: 0,
      completionRate: 0,
      startSmokingStats: [],
      frequencyStats: [],
      dailyAmountStats: [],
      reasonsStats: [],
      tobaccoTypeStats: [],
      quitIntentionStats: [],
      instructorStats: [],
      classStats: []
    };
  }

  const stats = {
    totalStudents: records.length,
    completedStudents: records.filter(r => r.status === 'completed').length,
    completionRate: Math.round((records.filter(r => r.status === 'completed').length / records.length) * 100),
    
    // 開始吸菸年齡統計
    startSmokingStats: [
      { name: '國小階段', value: 0 },
      { name: '國中階段', value: 0 },
      { name: '高中階段', value: 0 },
      { name: '大學以後', value: 0 }
    ],
    
    // 吸菸頻率統計
    frequencyStats: [
      { name: '每天抽', value: 0 },
      { name: '1-2天抽1次', value: 0 },
      { name: '3-4天抽1次', value: 0 },
      { name: '1週抽1次', value: 0 }
    ],
    
    // 每日吸菸量統計
    dailyAmountStats: [
      { name: '1-2支', value: 0 },
      { name: '3-4支', value: 0 },
      { name: '5-9支', value: 0 },
      { name: '10支以上', value: 0 }
    ],
    
    // 吸菸原因統計
    reasonsStats: [
      { name: '專心', value: 0 },
      { name: '放鬆', value: 0 },
      { name: '習慣', value: 0 },
      { name: '交際', value: 0 },
      { name: '打發時間', value: 0 },
      { name: '其它', value: 0 }
    ],
    
    // 菸品類型統計
    tobaccoTypeStats: [
      { name: '紙煙', value: 0 },
      { name: '電子煙', value: 0 },
      { name: '加熱煙', value: 0 }
    ],
    
    // 戒菸意願統計
    quitIntentionStats: [
      { name: '有戒菸意願', value: 0 },
      { name: '無戒菸意願', value: 0 }
    ],
    
    // 輔導教官統計
    instructorStats: [] as { name: string; value: number }[],
    
    // 班級統計
    classStats: [] as { name: string; value: number }[]
  };

  // 計算各項統計數據
  records.forEach(record => {
    // 開始吸菸年齡統計
    const startIdx = stats.startSmokingStats.findIndex(s => s.name === record.startSmoking);
    if (startIdx !== -1) stats.startSmokingStats[startIdx].value++;
    
    // 吸菸頻率統計
    const freqIdx = stats.frequencyStats.findIndex(s => s.name === record.frequency);
    if (freqIdx !== -1) stats.frequencyStats[freqIdx].value++;
    
    // 每日吸菸量統計
    const amountIdx = stats.dailyAmountStats.findIndex(s => s.name === record.dailyAmount);
    if (amountIdx !== -1) stats.dailyAmountStats[amountIdx].value++;
    
    // 吸菸原因統計（可能多選）
    if (record.reasons && Array.isArray(record.reasons)) {
      record.reasons.forEach((reason: string) => {
        const reasonIdx = stats.reasonsStats.findIndex(s => s.name === reason);
        if (reasonIdx !== -1) stats.reasonsStats[reasonIdx].value++;
      });
    }
    
    // 菸品類型統計
    const typeIdx = stats.tobaccoTypeStats.findIndex(s => s.name === record.tobaccoType);
    if (typeIdx !== -1) stats.tobaccoTypeStats[typeIdx].value++;
    
    // 戒菸意願統計
    const intentionIdx = stats.quitIntentionStats.findIndex(s => 
      s.name === (record.quitIntention === '有' ? '有戒菸意願' : '無戒菸意願')
    );
    if (intentionIdx !== -1) stats.quitIntentionStats[intentionIdx].value++;
    
    // 輔導教官統計
    const existingInstructor = stats.instructorStats.find(s => s.name === record.instructor);
    if (existingInstructor) {
      existingInstructor.value++;
    } else {
      stats.instructorStats.push({ name: record.instructor, value: 1 });
    }
    
    // 班級統計
    const existingClass = stats.classStats.find(s => s.name === record.class);
    if (existingClass) {
      existingClass.value++;
    } else {
      stats.classStats.push({ name: record.class, value: 1 });
    }
  });

  // 按數量排序
  stats.instructorStats.sort((a, b) => b.value - a.value);
  stats.classStats.sort((a, b) => b.value - a.value);

  return stats;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    // 在實際應用中，這裡應該從資料庫獲取數據
    // 暫時從記憶體中的 studentsData 讀取
    
    // 為了演示，如果沒有資料，創建一些示例資料
    if (studentsData.length === 0) {
      // 創建示例數據用於演示
      const sampleData = [
        {
          id: '1',
          name: '張小明',
          class: '資工系二甲',
          studentId: 'A123456789',
          phone: '0912345678',
          instructor: '郭威均教官',
          startSmoking: '高中階段',
          frequency: '每天抽',
          dailyAmount: '5-9支',
          reasons: ['放鬆', '習慣'],
          familySmoking: '有',
          campusAwareness: '知道',
          signageAwareness: '有',
          tobaccoType: '紙煙',
          quitAttempts: '有',
          quitIntention: '有',
          counselingInterest: '有',
          status: 'completed',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: '李小華',
          class: '企管系一乙',
          studentId: 'B987654321',
          phone: '0987654321',
          instructor: '陳鈴玉教官',
          startSmoking: '大學以後',
          frequency: '1-2天抽1次',
          dailyAmount: '1-2支',
          reasons: ['交際', '打發時間'],
          familySmoking: '沒有',
          campusAwareness: '知道',
          signageAwareness: '有',
          tobaccoType: '電子煙',
          quitAttempts: '沒有',
          quitIntention: '有',
          counselingInterest: '有',
          status: 'in_progress',
          createdAt: new Date().toISOString()
        }
      ];
      studentsData = sampleData;
    }

    const statistics = generateStatistics(studentsData);
    
    res.status(200).json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('統計數據生成錯誤:', error);
    res.status(500).json({
      success: false,
      error: '統計數據生成失敗'
    });
  }
}
