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
