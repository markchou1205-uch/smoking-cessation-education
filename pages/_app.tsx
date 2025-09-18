// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Head from 'next/head';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>健行科技大學戒菸教育系統</title>
        <meta name="description" content="健行科技大學戒菸教育執行系統，提供完整的戒菸教育流程與記錄管理" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="戒菸教育,健行科技大學,菸害防制,教育系統" />
        <meta name="author" content="健行科技大學" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="健行科技大學戒菸教育系統" />
        <meta property="og:description" content="提供完整的戒菸教育流程與記錄管理" />
        <meta property="og:site_name" content="健行科技大學戒菸教育系統" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="健行科技大學戒菸教育系統" />
        <meta name="twitter:description" content="提供完整的戒菸教育流程與記錄管理" />
      </Head>
      
      <div className={`${inter.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </>
  );
}
