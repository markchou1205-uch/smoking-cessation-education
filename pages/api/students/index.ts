// pages/api/students/index.ts - 學生資料管理
import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // 建立新學生記錄
    try {
      const { name, class: className, studentId, phone, instructor } = req.body;
      
      const result = await sql`
        INSERT INTO students_info (name, class, student_id, phone, instructor)
        VALUES (${name}, ${className}, ${studentId}, ${phone}, ${instructor})
        RETURNING *
      `;
      
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  } else if (req.method === 'GET') {
    // 獲取所有學生記錄
    try {
      const result = await sql`
        SELECT 
          si.*,
          ss.start_smoking, ss.frequency, ss.daily_amount, ss.reasons,
          vr.total_time, vr.violations, vr.focus_percentage, vr.completed as video_completed,
          cr.final_completed,
          es.selected_date
        FROM students_info si
        LEFT JOIN smoking_survey ss ON si.student_id = ss.student_id
        LEFT JOIN video_records vr ON si.student_id = vr.student_id
        LEFT JOIN completion_records cr ON si.student_id = cr.student_id
        LEFT JOIN event_selection es ON si.student_id = es.student_id
        ORDER BY si.created_at DESC
      `;
      
      res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/api/survey/index.ts - 吸菸調查
export async function surveyHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {
        studentId,
        startSmoking,
        frequency,
        dailyAmount,
        reasons,
        familySmoking,
        campusAwareness,
        signageAwareness,
        tobaccoType,
        quitAttempts,
        quitIntention,
        counselingInterest
      } = req.body;
      
      const result = await sql`
        INSERT INTO smoking_survey (
          student_id, start_smoking, frequency, daily_amount, reasons,
          family_smoking, campus_awareness, signage_awareness, tobacco_type,
          quit_attempts, quit_intention, counseling_interest
        ) VALUES (
          ${studentId}, ${startSmoking}, ${frequency}, ${dailyAmount}, ${JSON.stringify(reasons)},
          ${familySmoking}, ${campusAwareness}, ${signageAwareness}, ${tobaccoType},
          ${quitAttempts}, ${quitIntention}, ${counselingInterest}
        ) RETURNING *
      `;
      
      // 更新完成記錄
      await sql`
        INSERT INTO completion_records (student_id, survey_completed)
        VALUES (${studentId}, true)
        ON CONFLICT (student_id) 
        DO UPDATE SET survey_completed = true, updated_at = CURRENT_TIMESTAMP
      `;
      
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  }
}

// pages/api/videos/progress.ts - 影片進度記錄
export async function videoProgressHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {
        studentId,
        video1Time,
        video2Time,
        video3Time,
        video4Time,
        totalTime,
        violations,
        focusPercentage,
        completed
      } = req.body;
      
      const result = await sql`
        INSERT INTO video_records (
          student_id, video_1_time, video_2_time, video_3_time, video_4_time,
          total_time, violations, focus_percentage, completed
        ) VALUES (
          ${studentId}, ${video1Time}, ${video2Time}, ${video3Time}, ${video4Time},
          ${totalTime}, ${violations}, ${focusPercentage}, ${completed}
        )
        ON CONFLICT (student_id)
        DO UPDATE SET
          video_1_time = ${video1Time},
          video_2_time = ${video2Time},
          video_3_time = ${video3Time},
          video_4_time = ${video4Time},
          total_time = ${totalTime},
          violations = ${violations},
          focus_percentage = ${focusPercentage},
          completed = ${completed},
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      
      // 更新完成記錄
      if (completed) {
        await sql`
          INSERT INTO completion_records (student_id, videos_completed)
          VALUES (${studentId}, true)
          ON CONFLICT (student_id) 
          DO UPDATE SET videos_completed = true, updated_at = CURRENT_TIMESTAMP
        `;
      }
      
      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  }
}

// pages/api/quiz/submit.ts - 測驗提交
export async function quizSubmitHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { studentId, answers, attemptNumber } = req.body;
      
      // 獲取所有題目和正確答案
      const questions = await sql`SELECT * FROM quiz_questions ORDER BY id`;
      
      // 批量插入答案
      const results = [];
      for (const [questionId, answer] of Object.entries(answers)) {
        const question = questions.rows.find(q => q.id === parseInt(questionId));
        const isCorrect = question?.correct_answer === answer;
        
        const result = await sql`
          INSERT INTO quiz_results (student_id, question_id, student_answer, is_correct, attempt_number)
          VALUES (${studentId}, ${questionId}, ${answer}, ${isCorrect}, ${attemptNumber})
        `;
        results.push({ questionId, isCorrect });
      }
      
      // 檢查是否全部正確
      const allCorrect = results.every(r => r.isCorrect);
      const incorrectQuestions = results.filter(r => !r.isCorrect).map(r => r.questionId);
      
      if (allCorrect) {
        // 更新完成記錄
        await sql`
          INSERT INTO completion_records (student_id, quiz_completed)
          VALUES (${studentId}, true)
          ON CONFLICT (student_id) 
          DO UPDATE SET quiz_completed = true, updated_at = CURRENT_TIMESTAMP
        `;
      }
      
      res.status(200).json({ 
        success: true, 
        allCorrect,
        incorrectQuestions,
        score: results.filter(r => r.isCorrect).length,
        total: results.length
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  }
}

// pages/api/event/select.ts - 宣導場次選擇
export async function eventSelectHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { studentId, selectedDate } = req.body;
      
      const result = await sql`
        INSERT INTO event_selection (student_id, selected_date)
        VALUES (${studentId}, ${selectedDate})
        ON CONFLICT (student_id)
        DO UPDATE SET selected_date = ${selectedDate}, completed_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      
      // 更新完成記錄
      await sql`
        INSERT INTO completion_records (student_id, event_selected, final_completed, completion_date)
        VALUES (${studentId}, true, true, CURRENT_TIMESTAMP)
        ON CONFLICT (student_id) 
        DO UPDATE SET 
          event_selected = true, 
          final_completed = true,
          completion_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  }
}

// pages/api/admin/statistics.ts - 統計資料
export async function statisticsHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // 開始吸菸時期統計
      const startSmokingStats = await sql`
        SELECT start_smoking, COUNT(*) as count
        FROM smoking_survey
        GROUP BY start_smoking
      `;
      
      // 吸菸頻率統計
      const frequencyStats = await sql`
        SELECT frequency, COUNT(*) as count
        FROM smoking_survey
        GROUP BY frequency
      `;
      
      // 每日吸菸量統計
      const dailyAmountStats = await sql`
        SELECT daily_amount, COUNT(*) as count
        FROM smoking_survey
        GROUP BY daily_amount
      `;
      
      // 吸菸原因統計（需要處理 JSON 陣列）
      const reasonsStats = await sql`
        SELECT reasons
        FROM smoking_survey
        WHERE reasons IS NOT NULL
      `;
      
      // 處理原因統計
      const reasonCounts: { [key: string]: number } = {};
      reasonsStats.rows.forEach(row => {
        const reasons = Array.isArray(row.reasons) ? row.reasons : JSON.parse(row.reasons || '[]');
        reasons.forEach((reason: string) => {
          reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        });
      });
      
      // 戒菸意願統計
      const quitIntentionStats = await sql`
        SELECT quit_intention, COUNT(*) as count
        FROM smoking_survey
        GROUP BY quit_intention
      `;
      
      // 完成度統計
      const completionStats = await sql`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN survey_completed THEN 1 ELSE 0 END) as survey_completed,
          SUM(CASE WHEN videos_completed THEN 1 ELSE 0 END) as videos_completed,
          SUM(CASE WHEN quiz_completed THEN 1 ELSE 0 END) as quiz_completed,
          SUM(CASE WHEN essay_completed THEN 1 ELSE 0 END) as essay_completed,
          SUM(CASE WHEN event_selected THEN 1 ELSE 0 END) as event_selected,
          SUM(CASE WHEN final_completed THEN 1 ELSE 0 END) as final_completed
        FROM completion_records
      `;
      
      // 影片觀看統計
      const videoStats = await sql`
        SELECT 
          AVG(total_time) as avg_watch_time,
          AVG(violations) as avg_violations,
          AVG(focus_percentage) as avg_focus_percentage
        FROM video_records
        WHERE completed = true
      `;
      
      const total = completionStats.rows[0]?.total || 0;
      
      const statistics = {
        startSmoking: startSmokingStats.rows.map(row => ({
          name: row.start_smoking,
          value: parseInt(row.count),
          percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100) : 0
        })),
        frequency: frequencyStats.rows.map(row => ({
          name: row.frequency,
          value: parseInt(row.count),
          percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100) : 0
        })),
        dailyAmount: dailyAmountStats.rows.map(row => ({
          name: row.daily_amount,
          value: parseInt(row.count),
          percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100) : 0
        })),
        reasons: Object.entries(reasonCounts).map(([name, value]) => ({
          name,
          value
        })),
        quitIntention: quitIntentionStats.rows.map(row => ({
          name: row.quit_intention === 'true' || row.quit_intention === true ? '有意願' : '沒有意願',
          value: parseInt(row.count),
          percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100) : 0
        })),
        completion: completionStats.rows[0],
        videoStats: videoStats.rows[0]
      };
      
      res.status(200).json({ success: true, data: statistics });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  }
}

// pages/api/admin/export.ts - 匯出資料
export async function exportHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await sql`
        SELECT 
          si.name,
          si.class,
          si.student_id,
          si.instructor,
          si.created_at as execution_date,
          ss.start_smoking,
          ss.frequency,
          ss.daily_amount,
          ss.reasons,
          ss.family_smoking,
          ss.campus_awareness,
          ss.signage_awareness,
          ss.tobacco_type,
          ss.quit_attempts,
          ss.quit_intention,
          ss.counseling_interest,
          vr.total_time,
          vr.violations,
          vr.focus_percentage,
          vr.completed as video_completed,
          cr.quiz_completed,
          cr.essay_completed,
          cr.event_selected,
          cr.final_completed,
          cr.completion_date,
          es.selected_date
        FROM students_info si
        LEFT JOIN smoking_survey ss ON si.student_id = ss.student_id
        LEFT JOIN video_records vr ON si.student_id = vr.student_id
        LEFT JOIN completion_records cr ON si.student_id = cr.student_id
        LEFT JOIN event_selection es ON si.student_id = es.student_id
        ORDER BY si.created_at DESC
      `;
      
      // 設定 CSV 標頭
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=smoking_cessation_records.csv');
      
      // CSV 標題行
      const headers = [
        '姓名', '班級', '學號', '輔導教官', '執行日期',
        '開始吸菸時期', '吸菸頻率', '每日吸菸量', '吸菸原因', '家中有人吸菸',
        '知道校園禁菸', '看過禁菸標示', '菸品類型', '嘗試過戒菸', '戒菸意願', '輔導興趣',
        '影片觀看時間', '違規次數', '專注度', '影片完成', '測驗完成', '心得完成',
        '場次選擇', '全部完成', '完成日期', '選擇場次'
      ];
      
      let csv = headers.join(',') + '\n';
      
      // 資料行
      result.rows.forEach(row => {
        const csvRow = [
          row.name,
          row.class,
          row.student_id,
          row.instructor,
          row.execution_date?.toISOString().split('T')[0] || '',
          row.start_smoking || '',
          row.frequency || '',
          row.daily_amount || '',
          Array.isArray(row.reasons) ? row.reasons.join(';') : '',
          row.family_smoking ? '是' : '否',
          row.campus_awareness ? '知道' : '不知道',
          row.signage_awareness ? '有' : '沒有',
          row.tobacco_type || '',
          row.quit_attempts ? '有' : '沒有',
          row.quit_intention ? '有' : '沒有',
          row.counseling_interest ? '有' : '沒有',
          row.total_time || '0',
          row.violations || '0',
          row.focus_percentage || '0',
          row.video_completed ? '是' : '否',
          row.quiz_completed ? '是' : '否',
          row.essay_completed ? '是' : '否',
          row.event_selected ? '是' : '否',
          row.final_completed ? '是' : '否',
          row.completion_date?.toISOString().split('T')[0] || '',
          row.selected_date || ''
        ];
        csv += csvRow.map(field => `"${field}"`).join(',') + '\n';
      });
      
      res.status(200).send('\ufeff' + csv); // UTF-8 BOM for Excel
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  }
}

// pages/api/progress/save.ts - 儲存進度
export async function saveProgressHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { studentId, step, data } = req.body;
      
      // 儲存到瀏覽器 localStorage 或資料庫
      // 這裡可以實作更複雜的進度儲存邏輯
      
      res.status(200).json({ success: true, message: 'Progress saved' });
    } catch (error) {
      console.error('Error saving progress:', error);
      res.status(500).json({ success: false, error: 'Failed to save progress' });
    }
  }
}

// lib/database.ts - 資料庫配置
export const dbConfig = {
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// 資料庫初始化函數
export async function initializeDatabase() {
  try {
    // 檢查資料表是否存在，如果不存在則建立
    await sql`
      CREATE TABLE IF NOT EXISTS students_info (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        class VARCHAR(50) NOT NULL,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        instructor VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// utils/pdf-generator.ts - PDF 生成工具
import jsPDF from 'jspdf';

export function generateCompletionRecord(studentData: any, selectedDate: string) {
  const doc = new jsPDF();
  
  // 設定中文字體（需要額外配置）
  doc.setFont('helvetica');
  doc.setFontSize(16);
  
  // 標題
  doc.text('健行科技大學戒菸教育執行記錄表', 20, 30);
  
  // 學生資訊
  doc.setFontSize(12);
  doc.text(`學生姓名：${studentData.name}`, 20, 50);
  doc.text(`班級：${studentData.class}`, 20, 65);
  doc.text(`學號：${studentData.studentId}`, 20, 80);
  
  // 執行日期
  const currentDate = new Date().toLocaleDateString('zh-TW');
  doc.text(`執行戒菸教育日期：${currentDate}`, 20, 95);
  doc.text('地點：軍訓室', 20, 110);
  
  // 執行項目
  doc.text('執行項目：', 20, 130);
  doc.text('一、完成吸菸情形調查。✓', 30, 145);
  doc.text('二、完成反菸宣導影片收視：共 __ 分 __ 秒。✓', 30, 160);
  doc.text('三、完成反菸知識作答，並全數通過。✓', 30, 175);
  doc.text('四、完成戒菸教育心得寫作500字，並交給輔導教官。✓', 30, 190);
  
  doc.text('輔導教官簽名：_______________', 30, 210);
  
  doc.text('五、完成菸害宣導參與場次勾選：', 30, 230);
  doc.text(`選擇場次：${selectedDate}`, 40, 245);
  
  doc.text('六、我知悉如果沒有參與指定日期的菸害宣導，', 30, 265);
  doc.text('將視同沒有完成戒菸教育，除了將依校規處份，', 30, 280);
  doc.text('學校也會依菸害防制法移送裁罰。', 30, 295);
  
  doc.text('學生簽名：_______________', 30, 315);
  
  return doc;
}

// utils/validation.ts - 表單驗證
export const validationRules = {
  studentId: {
    required: true,
    pattern: /^\d{7,10}$/,
    message: '學號格式不正確'
  },
  phone: {
    required: true,
    pattern: /^09\d{8}$/,
    message: '手機號碼格式不正確'
  },
  name: {
    required: true,
    minLength: 2,
    message: '姓名至少需要2個字'
  }
};

export function validateForm(data: any, rules: any) {
  const errors: { [key: string]: string } = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${field} 為必填欄位`;
      return;
    }
    
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message;
      return;
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = rule.message;
      return;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 
