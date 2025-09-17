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
