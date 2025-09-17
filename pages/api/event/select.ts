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
