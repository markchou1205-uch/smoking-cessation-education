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
