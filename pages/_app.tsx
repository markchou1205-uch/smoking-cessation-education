import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '../styles/globals.css'

// 全域錯誤處理
function handleGlobalError(error: Error) {
  console.error('Global error:', error)
  // 可以發送到錯誤追蹤服務
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // 全域錯誤處理
    window.addEventListener('error', (event) => {
      handleGlobalError(event.error)
    })

    window.addEventListener('unhandledrejection', (event) => {
      handleGlobalError(new Error(event.reason))
    })

    // 預防作弊：禁用右鍵選單和開發者工具快捷鍵
    const preventContextMenu = (e: MouseEvent) => e.preventDefault()
    const preventDevTools = (e: KeyboardEvent) => {
      // 禁用 F12, Ctrl+Shift+I, Ctrl+U 等
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault()
        alert('為了維護考試公平性，此功能已被停用')
      }
    }

    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('keydown', preventDevTools)

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('keydown', preventDevTools)
    }
  }, [])

  return <Component {...pageProps} />
}
