// pages/api/admin/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// 管理員帳號設定（實際應用中應該存在資料庫中並加密）
const ADMIN_ACCOUNTS = [
  {
    username: 'admin',
    password: 'admin123', // 實際應用中應該是加密後的密碼
    role: 'super_admin'
  },
  {
    username: 'teacher',
    password: 'teacher123',
    role: 'teacher'
  }
];

// 生成簡單的 JWT Token（實際應用中應使用正式的 JWT 庫）
function generateToken(username: string, role: string): string {
  const payload = {
    username,
    role,
    timestamp: Date.now(),
    expires: Date.now() + (24 * 60 * 60 * 1000) // 24小時後過期
  };
  
  // 簡單的 base64 編碼（實際應用中應使用 JWT 簽名）
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed'
    });
  }

  try {
    const { username, password } = req.body;

    // 驗證必填欄位
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '請輸入帳號和密碼'
      });
    }

    // 尋找管理員帳號
    const admin = ADMIN_ACCOUNTS.find(
      account => account.username === username && account.password === password
    );

    if (!admin) {
      // 記錄登入失敗（實際應用中可以增加防暴力破解機制）
      console.log(`登入失敗 - 帳號: ${username}, IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
      
      return res.status(401).json({
        success: false,
        error: '帳號或密碼錯誤'
      });
    }

    // 生成 Token
    const token = generateToken(admin.username, admin.role);

    // 記錄登入成功
    console.log(`管理員登入成功 - 帳號: ${admin.username}, 角色: ${admin.role}, 時間: ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: '登入成功',
      token,
      user: {
        username: admin.username,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('登入處理錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
}
