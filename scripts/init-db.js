// scripts/init-db.js - 資料庫初始化腳本
const { sql } = require('@vercel/postgres');

async function initDatabase() {
  try {
    console.log('正在初始化資料庫...');
    
    // 執行建表 SQL
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
      );
    `;
    
    // 其他表的建立...
    
    console.log('資料庫初始化完成！');
  } catch (error) {
    console.error('資料庫初始化失敗：', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase }; 
