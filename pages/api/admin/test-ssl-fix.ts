// pages/api/admin/test-ssl-fix.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { 
  testMultipleConnectionMethods, 
  initializeDatabaseTables,
  executeQuery 
} from '../../../lib/database-ssl-fix';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { action } = req.query;

  try {
    switch (action) {
      case 'test':
        console.log('開始多方法連接測試...');
        const testResult = await testMultipleConnectionMethods();
        return res.status(testResult.success ? 200 : 500).json(testResult);

      case 'init':
        if (req.method !== 'POST') {
          return res.status(405).json({
            success: false,
            error: 'POST method required for initialization'
          });
        }
        
        console.log('開始資料庫初始化...');
        const initResult = await initializeDatabaseTables();
        return res.status(initResult.success ? 200 : 500).json(initResult);

      case 'status':
        try {
          // 檢查表格狀態
          const tablesResult = await executeQuery(`
            SELECT table_name, 
                   (SELECT count(*) FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public'
            ORDER BY table_name;
          `);

          const requiredTables = [
            'students_info',
            'smoking_survey', 
            'video_records',
            'quiz_results',
            'completion_records'
          ];

          const existingTables = tablesResult.rows.map((row: any) => row.table_name);
          const missingTables = requiredTables.filter(table => !existingTables.includes(table));

          return res.status(200).json({
            success: true,
            message: '資料庫狀態檢查完成',
            details: {
              totalTables: existingTables.length,
              requiredTables: requiredTables.length,
              existingTables,
              missingTables,
              ready: missingTables.length === 0,
              tables: tablesResult.rows
            }
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: `狀態檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
          });
        }

      case 'simple':
        // 簡單查詢測試
        try {
          const result = await executeQuery('SELECT NOW() as current_time, current_database() as db_name');
          return res.status(200).json({
            success: true,
            message: '簡單查詢成功',
            details: {
              currentTime: result.rows[0].current_time,
              database: result.rows[0].db_name
            }
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: `簡單查詢失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
          });
        }

      default:
        return res.status(400).json({
          success: false,
          message: '無效的操作',
          availableActions: ['test', 'init', 'status', 'simple']
        });
    }
  } catch (error) {
    console.error('SSL 修正測試 API 錯誤:', error);
    return res.status(500).json({
      success: false,
      message: '測試過程中發生錯誤',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
