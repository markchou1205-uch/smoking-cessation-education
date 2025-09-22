// lib/vercel-postgres.ts - 針對 Vercel Postgres 的專用配置
import { Pool, PoolConfig } from 'pg';

// Vercel Postgres 專用連接配置
const getVercelPostgresConfig = (): PoolConfig => {
  // 如果使用 Vercel Postgres，通常會有這些環境變數
  const postgresUrl = process.env.POSTGRES_URL;
  const postgresUrlNonPooling = process.env.POSTGRES_URL_NON_POOLING;
  
  // 優先使用非池化連接進行測試
  const connectionString = postgresUrlNonPooling || postgresUrl || process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('找不到資料庫連接字串');
  }

  return {
    connectionString,
    ssl: {
      rejectUnauthorized: false, // Vercel Postgres 需要這個設定
    },
    max: 1, // 測試時只使用一個連接
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 15000,
  };
};

// 建立 Vercel Postgres 連接池
let vercelPool: Pool | null = null;

export const getVercelPool = (): Pool => {
  if (!vercelPool) {
    try {
      const config = getVercelPostgresConfig();
      vercelPool = new Pool(config);
      
      vercelPool.on('error', (err) => {
        console.error('Vercel Postgres 連接池錯誤:', err);
      });
      
      console.log('Vercel Postgres 連接池已建立');
    } catch (error) {
      console.error('建立 Vercel Postgres 連接池失敗:', error);
      throw error;
    }
  }
  
  return vercelPool;
};

// Vercel Postgres 連接測試
export const testVercelPostgresConnection = async () => {
  try {
    console.log('測試 Vercel Postgres 連接...');
    
    const pool = getVercelPool();
    const client = await pool.connect();
    
    try {
      // 測試查詢
      const result = await client.query('SELECT NOW() as current_time, current_database() as database_name');
      
      console.log('Vercel Postgres 連接成功');
      
      return {
        success: true,
        message: 'Vercel Postgres 連接成功',
        details: {
          currentTime: result.rows[0].current_time,
          database: result.rows[0].database_name,
          connectionType: 'Vercel Postgres'
        }
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Vercel Postgres 連接失敗:', error);
    return {
      success: false,
      message: `Vercel Postgres 連接失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      details: {
        error: error instanceof Error ? error.message : String(error),
        environment: {
          hasPostgresUrl: !!process.env.POSTGRES_URL,
          hasPostgresUrlNonPooling: !!process.env.POSTGRES_URL_NON_POOLING,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          nodeEnv: process.env.NODE_ENV
        }
      }
    };
  }
};

// 執行 SQL 查詢
export const vercelQuery = async (text: string, params?: any[]) => {
  const pool = getVercelPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};
