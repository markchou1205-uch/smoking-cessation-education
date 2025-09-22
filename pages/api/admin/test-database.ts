// pages/api/admin/test-database.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { 
  testDatabaseConnection, 
  initializeDatabase, 
  checkTableExists, 
  getTableInfo 
} from '../../../lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed'
    });
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'test':
        // 測試資料庫連接
        const testResult = await testDatabaseConnection();
        return res.status(testResult.success ? 200 : 500).json(testResult);

      case 'init':
        // 初始化資料庫（建立表格）
        if (req.method !== 'POST') {
          return res.status(405).json({
            success: false,
            error: 'POST method required for initialization'
          });
        }
        
        const initResult = await initializeDatabase();
        return res.status(initResult.success ? 200 : 500).json(initResult);

      case 'status':
        // 檢查資料庫狀態
        const statusResult = await getDatabaseStatus();
        return res.status(200).json(statusResult);

      default:
        // 預設返回連接測試結果
        const defaultResult = await testDatabaseConnection();
        return res.status(defaultResult.success ? 200 : 500).json(defaultResult);
    }
  } catch (error) {
    console.error('資料庫測試 API 錯誤:', error);
    return res.status(500).json({
      success: false,
      message: '測試過程中發生錯誤',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 獲取資料庫狀態
async function getDatabaseStatus() {
  try {
    const connectionTest = await testDatabaseConnection();
    
    if (!connectionTest.success) {
      return {
        success: false,
        message: '無法連接到資料庫',
        details: connectionTest.details
      };
    }

    // 檢查必要的表格
    const requiredTables = [
      'students_info',
      'smoking_survey',
      'video_records',
      'quiz_results',
      'completion_records'
    ];

    const tableStatus = [];
    
    for (const tableName of requiredTables) {
      const exists = await checkTableExists(tableName);
      const info = exists ? await getTableInfo(tableName) : [];
      
      tableStatus.push({
        name: tableName,
        exists,
        columns: info.length,
        details: info
      });
    }

    const existingTables = tableStatus.filter(t => t.exists);
    const missingTables = tableStatus.filter(t => !t.exists);

    return {
      success: true,
      message: '資料庫狀態檢查完成',
      details: {
        connection: connectionTest.details,
        tables: {
          total: requiredTables.length,
          existing: existingTables.length,
          missing: missingTables.length,
          status: tableStatus
        },
        ready: missingTables.length === 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `狀態檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
    };
  }
}
