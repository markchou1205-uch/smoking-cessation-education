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
