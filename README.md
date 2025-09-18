# 健行科技大學戒菸教育系統

> 一個完整的戒菸教育執行系統，提供學生端教育流程與管理員後台統計功能

## 📋 專案簡介

本系統為健行科技大學開發的戒菸教育執行平台，針對違規吸菸學生提供完整的教育流程，包含：

- 個人資料填寫與吸菸狀況調查
- 戒菸宣導影片觀看
- 戒菸常識測驗
- 心得寫作指導
- 宣導活動場次選擇
- 完成證明PDF生成
- 後台管理與統計分析

## 🚀 功能特色

### 學生端功能
- ✅ **完整教育流程**：6個步驟的戒菸教育
- ✅ **智慧測驗系統**：答錯重看相關影片
- ✅ **進度追蹤**：清楚的步驟指示
- ✅ **響應式設計**：支援各種裝置
- ✅ **PDF生成**：自動產生完成證明

### 管理端功能
- ✅ **學生記錄管理**：完整的參與記錄
- ✅ **統計圖表**：多維度數據分析
- ✅ **篩選搜尋**：彈性的資料查詢
- ✅ **資料匯出**：CSV格式匯出
- ✅ **即時統計**：關鍵指標儀表板

## 🛠️ 技術架構

- **前端框架**：Next.js 14 + TypeScript
- **樣式系統**：Tailwind CSS
- **圖表庫**：Recharts
- **圖示庫**：Lucide React
- **PDF生成**：jsPDF
- **部署平台**：Vercel

## 📦 安裝說明

### 1. 克隆專案

```bash
git clone https://github.com/your-repo/smoking-cessation-education.git
cd smoking-cessation-education
```

### 2. 安裝依賴

```bash
npm install
```

或使用 yarn：

```bash
yarn install
```

### 3. 環境設定

```bash
# 複製環境變數範例檔案
cp .env.local.example .env.local

# 編輯環境變數
nano .env.local
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 🏗️ 專案結構

```
smoking-cessation-education/
├── pages/                  # Next.js 頁面
│   ├── index.tsx          # 主應用程式
│   ├── _app.tsx           # 應用程式入口
│   └── api/               # API 路由
├── components/             # React 組件
│   ├── PersonalInfoPage.tsx
│   ├── VideoPage.tsx
│   ├── QuizPage.tsx
│   ├── EssayPage.tsx
│   ├── EventSelectionPage.tsx
│   ├── CompletionPage.tsx
│   ├── AdminDashboard.tsx
│   └── ProgressIndicator.tsx
├── styles/                # 樣式檔案
│   └── globals.css
├── public/                # 靜態資源
├── lib/                   # 工具函數
└── utils/                 # 輔助工具
```

## 🎯 使用流程

### 學生端使用流程

1. **個人資料填寫**
   - 填寫基本資料（姓名、班級、學號等）
   - 完成11項吸菸狀況調查

2. **觀看宣導影片**
   - 觀看4部戒菸宣導影片
   - 系統計時16分鐘確保觀看

3. **戒菸常識測驗**
   - 20題測驗（10題是非 + 10題選擇）
   - 答錯需重看相關影片並重新作答

4. **心得寫作**
   - 撰寫500字戒菸教育心得
   - 提供寫作指導與範例

5. **選擇宣導場次**
   - 選擇參加的戒菸宣導活動
   - 確認參與義務與法律責任

6. **完成證明**
   - 自動生成PDF完成證明
   - 列印交給輔導教官

### 管理員使用流程

1. **登入後台系統**
2. **查看統計儀表板**
3. **管理學生記錄**
4. **分析統計數據**
5. **匯出報表資料**

## 🔧 開發說明

### 開發者模式功能

在開發環境中，系統提供以下快速測試功能：

```javascript
// 瀏覽器控制台可用的快速指令
window.skipToNext()           // 跳過當前步驟
window.setWatchTime(分鐘)     // 設定影片觀看時間
```

### 建置部署

```bash
# 建置生產版本
npm run build

# 啟動生產伺服器
npm start

# 代碼檢查
npm run lint
```

## 📊 系統特色

### 教育設計理念
- **後果學習**：答錯重看，強化記憶
- **主動學習**：學生主動尋找答案
- **個人化**：針對錯誤進行補強
- **完整性**：涵蓋完整戒菸教育流程

### 技術創新
- **簡化防作弊**：用教育邏輯取代技術監控
- **響應式設計**：支援各種裝置
- **模組化架構**：易於維護與擴展
- **無障礙設計**：符合網頁可及性標準

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 📞 聯絡資訊

- **開發團隊**：健行科技大學資訊中心
- **專案負責人**：[您的姓名]
- **Email**：admin@uch.edu.tw
- **專案網址**：https://github.com/your-repo/smoking-cessation-education

## 🙏 致謝

感謝所有參與開發和測試的同仁，以及健行科技大學對本專案的支持。

---

**健行科技大學戒菸教育系統** - 為了學生的健康未來 🚭
