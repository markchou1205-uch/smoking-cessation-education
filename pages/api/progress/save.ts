// pages/api/progress/save.ts - 儲存進度
export async function saveProgressHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { studentId, step, data } = req.body;
      
      // 儲存到瀏覽器 localStorage 或資料庫
      // 這裡可以實作更複雜的進度儲存邏輯
      
      res.status(200).json({ success: true, message: 'Progress saved' });
    } catch (error) {
      console.error('Error saving progress:', error);
      res.status(500).json({ success: false, error: 'Failed to save progress' });
    }
  }
} 
