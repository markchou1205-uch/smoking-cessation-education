// lib/database.ts
import { Pool, PoolConfig } from 'pg';

// 資料庫連接配置
const dbConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// 建立連接池
let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // 監聽連接錯誤
    pool.on('error', (err) => {
      console.error('資料庫連接池錯誤:', err);
    });
  }
  
  return pool;
};

// 測試資料庫連接
export const testDatabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    const pool = getPool();
    
    // 測試基本連接
    const client = await pool.connect();
    
    try {
      // 執行簡單的查詢
      const result = await client.query('SELECT NOW() as current_time, version() as version');
      
      // 檢查是否有我們的表格
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      const tables = tablesResult.rows.map(row => row.table_name);
      
      return {
        success: true,
        message: '資料庫連接成功',
        details: {
          currentTime: result.rows[0].current_time,
          version: result.rows[0].version,
          availableTables: tables,
          totalTables: tables.length
        }
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('資料庫連接測試失敗:', error);
    return {
      success: false,
      message: `資料庫連接失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      details: {
        error: error instanceof Error ? error.message : String(error),
        config: {
          hasConnectionString: !!process.env.DATABASE_URL || !!process.env.POSTGRES_URL,
          nodeEnv: process.env.NODE_ENV
        }
      }
    };
  }
};

// 執行 SQL 查詢的通用函數
export const query = async (text: string, params?: any[]): Promise<any> => {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// 檢查表格是否存在
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`檢查表格 ${tableName} 是否存在時發生錯誤:`, error);
    return false;
  }
};

// 取得表格資訊
export const getTableInfo = async (tableName: string) => {
  try {
    const result = await query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    
    return result.rows;
  } catch (error) {
    console.error(`取得表格 ${tableName} 資訊時發生錯誤:`, error);
    return [];
  }
};

// 初始化資料庫（建立表格）
export const initializeDatabase = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    // 讀取並執行 database.sql 中的建表語句
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

    await query(createTablesSQL);

    // 檢查建立的表格
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    return {
      success: true,
      message: '資料庫初始化成功',
      details: {
        tablesCreated: tables.rows.map((row: any) => row.table_name)
      }
    };
  } catch (error) {
    console.error('資料庫初始化失敗:', error);
    return {
      success: false,
      message: `資料庫初始化失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
    };
  }
};
