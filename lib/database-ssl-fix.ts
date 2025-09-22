// lib/database-ssl-fix.ts - 專門解決 SSL 證書問題
import { Pool, Client } from 'pg';

// 強制設定 Node.js 忽略 SSL 證書錯誤
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 最寬鬆的 SSL 配置
const createSSLFreeConfig = () => {
  const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('未找到資料庫連接字串');
  }

  return {
    connectionString,
    ssl: false, // 完全禁用 SSL
    max: 1,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 8000,
  };
};

// 如果禁用 SSL 失敗，使用最寬鬆的 SSL 設定
const createLoosestSSLConfig = () => {
  const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
  
  return {
    connectionString,
    ssl: {
      rejectUnauthorized: false,
      requestCert: false,
      verifyServerCert: false,
      checkServerIdentity: () => undefined,
    },
    max: 1,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 8000,
  };
};

// 嘗試多種連接方式
export const testMultipleConnectionMethods = async () => {
  const methods = [
    { name: '禁用 SSL', config: createSSLFreeConfig },
    { name: '寬鬆 SSL', config: createLoosestSSLConfig },
  ];

  for (const method of methods) {
    try {
      console.log(`嘗試方法: ${method.name}`);
      
      const config = method.config();
      const client = new Client(config);
      
      await client.connect();
      
      // 測試查詢
      const result = await client.query('SELECT NOW() as current_time, version() as version');
      
      await client.end();
      
      return {
        success: true,
        message: `${method.name} 連接成功`,
        method: method.name,
        details: {
          currentTime: result.rows[0].current_time,
          version: result.rows[0].version.substring(0, 100) + '...',
          connectionMethod: method.name
        }
      };
    } catch (error) {
      console.log(`${method.name} 失敗:`, error instanceof Error ? error.message : error);
      continue;
    }
  }

  // 所有方法都失敗
  return {
    success: false,
    message: '所有連接方法都失敗',
    details: {
      attemptedMethods: methods.map(m => m.name),
      environment: {
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasPostgresUrlNonPooling: !!process.env.POSTGRES_URL_NON_POOLING,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        nodeTlsRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED
      }
    }
  };
};

// 使用成功的方法建立連接池
let workingPool: Pool | null = null;
let workingMethod: string | null = null;

export const getWorkingPool = async (): Promise<Pool> => {
  if (workingPool && workingMethod) {
    return workingPool;
  }

  // 先測試哪種方法有效
  const testResult = await testMultipleConnectionMethods();
  
  if (!testResult.success) {
    throw new Error('無法建立資料庫連接');
  }

  // 使用成功的方法建立連接池
  let config;
  if (testResult.method === '禁用 SSL') {
    config = createSSLFreeConfig();
  } else {
    config = createLoosestSSLConfig();
  }

  workingPool = new Pool(config);
  workingMethod = testResult.method;

  workingPool.on('error', (err) => {
    console.error('連接池錯誤:', err);
    // 重置連接池，下次會重新建立
    workingPool = null;
    workingMethod = null;
  });

  return workingPool;
};

// 執行查詢
export const executeQuery = async (text: string, params?: any[]) => {
  try {
    const pool = await getWorkingPool();
    const client = await pool.connect();
    
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('查詢執行失敗:', error);
    throw error;
  }
};

// 初始化資料庫表格
export const initializeDatabaseTables = async () => {
  try {
    const createTablesSQL = `
      -- 建立學生基本資料表
      CREATE TABLE IF NOT EXISTS students_info (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(50) NOT NULL,
        class VARCHAR(50) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        instructor VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 建立吸菸調查表
      CREATE TABLE IF NOT EXISTS smoking_survey (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(10) REFERENCES students_info(student_id) ON DELETE CASCADE,
        start_smoking VARCHAR(20),
        frequency VARCHAR(20),
        daily_amount VARCHAR(20),
        reasons TEXT[],
        family_smoking VARCHAR(10),
        campus_awareness VARCHAR(10),
        signage_awareness VARCHAR(10),
        tobacco_type VARCHAR(20),
        quit_attempts VARCHAR(10),
        quit_intention VARCHAR(10),
        counseling_interest VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 建立影片觀看記錄表
      CREATE TABLE IF NOT EXISTS video_records (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(10) REFERENCES students_info(student_id) ON DELETE CASCADE,
        video_id VARCHAR(20) NOT NULL,
        watch_time INTEGER DEFAULT 0,
        total_time INTEGER,
        completed BOOLEAN DEFAULT FALSE,
        focus_violations INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 建立測驗結果表
      CREATE TABLE IF NOT EXISTS quiz_results (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(10) REFERENCES students_info(student_id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL,
        selected_answer INTEGER NOT NULL,
        is_correct BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 建立完成記錄表
      CREATE TABLE IF NOT EXISTS completion_records (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(10) REFERENCES students_info(student_id) ON DELETE CASCADE,
        all_completed BOOLEAN DEFAULT FALSE,
        completion_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 建立索引
      CREATE INDEX IF NOT EXISTS idx_students_student_id ON students_info(student_id);
      CREATE INDEX IF NOT EXISTS idx_smoking_survey_student_id ON smoking_survey(student_id);
      CREATE INDEX IF NOT EXISTS idx_video_records_student_id ON video_records(student_id);
      CREATE INDEX IF NOT EXISTS idx_quiz_results_student_id ON quiz_results(student_id);
      CREATE INDEX IF NOT EXISTS idx_completion_records_student_id ON completion_records(student_id);
    `;

    await executeQuery(createTablesSQL);

    // 檢查建立的表格
    const tablesResult = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    return {
      success: true,
      message: `資料庫初始化成功 (使用 ${workingMethod})`,
      details: {
        tablesCreated: tablesResult.rows.map((row: any) => row.table_name),
        connectionMethod: workingMethod
      }
    };
  } catch (error) {
    console.error('資料庫初始化失敗:', error);
    return {
      success: false,
      message: `資料庫初始化失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      details: {
        error: error instanceof Error ? error.message : String(error),
        connectionMethod: workingMethod
      }
    };
  }
};
