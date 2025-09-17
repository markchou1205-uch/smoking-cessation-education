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
