// 部署腳本 - deploy.sh
#!/bin/bash

echo "開始部署戒菸教育系統..."

# 檢查環境變數
if [ -z "$POSTGRES_URL" ]; then
    echo "錯誤：請設定 POSTGRES_URL 環境變數"
    exit 1
fi

# 安裝依賴
echo "安裝依賴套件..."
npm install

# 建置專案
echo "建置專案..."
npm run build

# 執行資料庫初始化
echo "初始化資料庫..."
npm run db:init

# 部署到 Vercel
echo "部署到 Vercel..."
vercel --prod

echo "部署完成！" 
# package.json scripts 更新
/*
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:init": "node scripts/init-db.js",
    "db:seed": "node scripts/seed-db.js",
    "deploy": "bash deploy.sh"
  }
}
*/
