// utils/pdf-generator.ts - PDF 生成工具
import jsPDF from 'jspdf';

export function generateCompletionRecord(studentData: any, selectedDate: string) {
  const doc = new jsPDF();
  
  // 設定中文字體（需要額外配置）
  doc.setFont('helvetica');
  doc.setFontSize(16);
  
  // 標題
  doc.text('健行科技大學戒菸教育執行記錄表', 20, 30);
  
  // 學生資訊
  doc.setFontSize(12);
  doc.text(`學生姓名：${studentData.name}`, 20, 50);
  doc.text(`班級：${studentData.class}`, 20, 65);
  doc.text(`學號：${studentData.studentId}`, 20, 80);
  
  // 執行日期
  const currentDate = new Date().toLocaleDateString('zh-TW');
  doc.text(`執行戒菸教育日期：${currentDate}`, 20, 95);
  doc.text('地點：軍訓室', 20, 110);
  
  // 執行項目
  doc.text('執行項目：', 20, 130);
  doc.text('一、完成吸菸情形調查。✓', 30, 145);
  doc.text('二、完成反菸宣導影片收視：共 __ 分 __ 秒。✓', 30, 160);
  doc.text('三、完成反菸知識作答，並全數通過。✓', 30, 175);
  doc.text('四、完成戒菸教育心得寫作500字，並交給輔導教官。✓', 30, 190);
  
  doc.text('輔導教官簽名：_______________', 30, 210);
  
  doc.text('五、完成菸害宣導參與場次勾選：', 30, 230);
  doc.text(`選擇場次：${selectedDate}`, 40, 245);
  
  doc.text('六、我知悉如果沒有參與指定日期的菸害宣導，', 30, 265);
  doc.text('將視同沒有完成戒菸教育，除了將依校規處份，', 30, 280);
  doc.text('學校也會依菸害防制法移送裁罰。', 30, 295);
  
  doc.text('學生簽名：_______________', 30, 315);
  
  return doc;
} 
