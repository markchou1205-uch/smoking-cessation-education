/*
# 健行科技大學戒菸教育系統

## 功能特色
- 完整的戒菸教育流程
- 防作弊監控機制
- 即時進度追蹤
- 統計分析後台
- PDF 記錄生成

## 技術架構
- Frontend: Next.js + React + TypeScript
- Backend: Next.js API Routes
- Database: PostgreSQL (Vercel Postgres)
- Styling: Tailwind CSS
- Charts: Recharts
- PDF: jsPDF

## 安裝步驟

1. 克隆專案
git clone [repo-url]
cd smoking-cessation-education

2. 安裝依賴
npm install

3. 設定環境變數
cp .env.example .env.local
# 編輯 .env.local 填入資料庫連線資訊

4. 初始化資料庫
npm run db:init

5. 啟動開發伺服器
npm run dev

## 部署到 Vercel

1. 連接 GitHub 儲存庫到 Vercel
2. 設定環境變數
3. 部署完成後執行資料庫初始化

## 系統架構

```
├── pages/
│   ├── api/               # API 路由
│   │   ├── students/      # 學生資料管理
│   │   ├── survey/        # 吸菸調查
│   │   ├── videos/        # 影片進度
│   │   ├── quiz/          # 測驗系統
│   │   ├── admin/         # 後台管理
│   │   └── export/        # 資料匯出
│   ├── admin/             # 後台管理頁面
│   └── index.tsx          # 主要應用程式
├── components/            # React 組件
├── lib/                   # 工具函數
├── styles/                # 樣式文件
└── public/                # 靜態資源
```

## 防作弊機制

1. **視窗監控**
   - 檢測視窗焦點狀態
   - 監控視窗大小變化
   - 頁面可見性檢測

2. **時間追蹤**
   - 只有在專心狀態下才計時
   - 記錄違規次數和時間
   - 專注度百分比計算

3. **進度保護**
   - 防止跳過影片
   - 測驗答案驗證
   - 完成度檢查

## 使用流程

### 學生端
1. 填寫個人資料和吸菸調查
2. 觀看四部戒菸宣導影片
3. 完成 20 題戒菸常識測驗
4. 撰寫 500 字心得報告
5. 選擇宣導活動場次
6. 列印完成記錄表

### 管理端
1. 查看學生執行記錄
2. 統計分析吸菸調查結果
3. 匯出 Excel 報表
4. 監控系統使用狀況

## API 端點

- `POST /api/students` - 建立學生記錄
- `POST /api/survey` - 提交吸菸調查
- `POST /api/videos/progress` - 更新影片進度
- `POST /api/quiz/submit` - 提交測驗答案
- `POST /api/event/select` - 選擇宣導場次
- `GET /api/admin/statistics` - 獲取統計資料
- `GET /api/admin/export` - 匯出資料

## 資料庫結構

主要資料表：
- `students_info` - 學生基本資料
- `smoking_survey` - 吸菸調查結果
- `video_records` - 影片觀看記錄
- `quiz_results` - 測驗結果
- `completion_records` - 完成度追蹤
- `event_selection` - 場次選擇

## 安全性

1. **輸入驗證** - 所有使用者輸入都經過驗證
2. **SQL 注入防護** - 使用參數化查詢
3. **CSRF 防護** - 實作 CSRF token
4. **存取控制** - 管理員路由保護
5. **資料加密** - 敏感資料加密存儲

## 效能優化

1. **圖片優化** - Next.js 自動圖片優化
2. **程式碼分割** - 動態載入非關鍵組件
3. **快取策略** - API 回應快取
4. **CDN 加速** - 靜態資源 CDN 分發

## 監控與維護

1. **錯誤追蹤** - 整合錯誤監控服務
2. **效能監控** - 監控 API 回應時間
3. **使用者分析** - 追蹤使用者行為
4. **備份策略** - 定期資料庫備份

## 常見問題

**Q: 學生可以重複進入系統嗎？**
A: 系統會檢查學號，已完成的學生無法重複執行。

**Q: 影片無法播放怎麼辦？**
A: 請確認網路連線，或聯絡技術支援。

**Q: 如何重置學生進度？**
A: 管理員可在後台重置特定學生的進度。

**Q: 資料可以匯出嗎？**
A: 可以，管理員可匯出 Excel 格式的完整記錄。

## 技術支援

如有任何技術問題，請聯絡：
- 電話：03-4581196
- 信箱：military@uch.edu.tw
- 地址：桃園市中壢區健行路229號

## 更新日誌

### v1.0.0 (2024-03-15)
- 初始版本發布
- 完整戒菸教育流程
- 防作弊監控機制
- 後台管理系統

### 未來規劃
- 手機 App 版本
- 多語言支援
- 進階統計分析
- 自動提醒功能
*/
