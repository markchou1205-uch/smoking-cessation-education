// pages/404.tsx
import React from 'react';
import Link from 'next/link';

const Custom404: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">頁面不存在</h1>
        <p className="text-gray-600 mb-8">抱歉，您訪問的頁面無法找到。</p>
        
        <div className="space-y-3">
          <Link 
            href="/"
            className="block w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首頁
          </Link>
          
          <Link 
            href="/admin/login"
            className="block w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            管理員登入
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Custom404;
