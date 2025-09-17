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
