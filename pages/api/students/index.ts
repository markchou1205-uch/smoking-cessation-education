// pages/api/students/index.ts
import { NextApiRequest, NextApiResponse } from 'next';

// 模擬資料庫（實際應用中應該使用真實資料庫）
let studentsData: any[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        res.status(200).json({
          success: true,
          data: studentsData
        });
      } catch (error) {
        console.error('取得資料錯誤:', error);
        res.status(500).json({
          success: false,
          error: '取得資料失敗'
        });
      }
      break;

    case 'POST':
      try {
        const studentData = req.body;

        // 驗證必填欄位
        if (!studentData.name || !studentData.studentId || !studentData.phone || !studentData.class) {
          return res.status(400).json({
            success: false,
            error: '請填寫所有必填欄位'
          });
        }

        // 驗證手機格式
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(studentData.phone)) {
          return res.status(400).json({
            success: false,
            error: '手機號碼格式錯誤，必須為10碼數字'
          });
        }

        // 驗證學號格式
        const studentIdRegex = /^[A-Za-z]\d{8}$/;
        if (!studentIdRegex.test(studentData.studentId)) {
          return res.status(400).json({
            success: false,
            error: '學號格式錯誤，必須為第1碼英文字母加8碼數字'
          });
        }

        // 檢查學號是否已存在
        const existingStudent = studentsData.find(s => s.studentId === studentData.studentId);
        if (existingStudent) {
          return res.status(400).json({
            success: false,
            error: '學號已存在'
          });
        }

        // 添加 ID 和時間戳
        const newStudent = {
          id: Date.now().toString(),
          ...studentData,
          status: 'in_progress', // 預設狀態
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // 儲存到模擬資料庫
        studentsData.push(newStudent);

        console.log('新學生資料已添加:', newStudent);

        res.status(201).json({
          success: true,
          message: '資料提交成功',
          data: newStudent
        });
      } catch (error) {
        console.error('API錯誤:', error);
        res.status(500).json({
          success: false,
          error: '伺服器錯誤'
        });
      }
      break;

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({
            success: false,
            error: '缺少學生ID'
          });
        }

        // 尋找學生資料的索引位置
        const studentIndex = studentsData.findIndex(s => s.id === id);
        
        if (studentIndex === -1) {
          return res.status(404).json({
            success: false,
            error: '找不到該學生資料'
          });
        }

        // 更新學生資料
        studentsData[studentIndex] = {
          ...studentsData[studentIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };

        console.log('學生資料已更新:', studentsData[studentIndex]);

        res.status(200).json({
          success: true,
          message: '資料更新成功',
          data: studentsData[studentIndex]
        });
      } catch (error) {
        console.error('更新錯誤:', error);
        res.status(500).json({
          success: false,
          error: '更新失敗'
        });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        if (!id || typeof id !== 'string') {
          return res.status(400).json({
            success: false,
            error: '缺少有效的學生ID'
          });
        }

        // 尋找學生資料的索引位置
        const studentIndex = studentsData.findIndex(s => s.id === id);
        
        if (studentIndex === -1) {
          return res.status(404).json({
            success: false,
            error: '找不到該學生資料'
          });
        }

        // 刪除學生資料
        const deletedStudent = studentsData.splice(studentIndex, 1)[0];
        
        console.log('學生資料已刪除:', deletedStudent);

        res.status(200).json({
          success: true,
          message: '資料刪除成功',
          data: deletedStudent
        });
      } catch (error) {
        console.error('刪除錯誤:', error);
        res.status(500).json({
          success: false,
          error: '刪除失敗'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`
      });
      break;
  }
}
