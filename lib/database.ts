// lib/database.ts - 資料庫配置
export const dbConfig = {
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// 資料庫初始化函數
export async function initializeDatabase() {
  try {
    // 檢查資料表是否存在，如果不存在則建立
    await sql`
      CREATE TABLE IF NOT EXISTS students_info (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        class VARCHAR(50) NOT NULL,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        instructor VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
} 
