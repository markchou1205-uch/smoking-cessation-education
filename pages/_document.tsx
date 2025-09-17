// pages/_document.tsx - Document 配置
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="zh-TW">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="健行科技大學戒菸教育系統" />
        <meta name="keywords" content="戒菸,教育,健行科技大學,菸害防制" />
        <meta name="author" content="健行科技大學軍訓室" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* 預載入重要資源 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.youtube.com" />
        
        {/* SEO 和社群媒體 meta tags */}
        <meta property="og:title" content="健行科技大學戒菸教育系統" />
        <meta property="og:description" content="線上戒菸教育學習平台" />
        <meta property="og:type" content="website" />
        
        {/* 防止縮放 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
        <script src="https://www.youtube.com/iframe_api"></script>
        {/* 載入統計腳本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 防作弊監控
              let violations = 0;
              let startTime = Date.now();
              
              // 監控視窗焦點
              window.addEventListener('blur', function() {
                violations++;
                console.log('視窗失去焦點，違規次數：', violations);
              });
              
              // 監控視窗大小
              window.addEventListener('resize', function() {
                if (window.innerWidth < 800 || window.innerHeight < 600) {
                  violations++;
                  console.log('視窗過小，違規次數：', violations);
                }
              });
              
              // 頁面離開前警告
              window.addEventListener('beforeunload', function(e) {
                if (violations > 0) {
                  const message = '您有違規操作記錄，確定要離開嗎？';
                  e.returnValue = message;
                  return message;
                }
              });
            `
          }}
        />
      </body>
    </Html>
  )
}
