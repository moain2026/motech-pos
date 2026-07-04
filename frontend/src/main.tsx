import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Providers } from '@/app/providers';
import { router } from '@/app/router';
import './styles.css';

// PWA service worker — تسجيل يدوي مع cache-busting لكل إصدار (build) حتى يصل
// التحديث فوراً ولو كان CDN/المتصفح يخزّن /sw.js القديم. updateViaCache:'none'
// يمنع كاش HTTP للـ SW وimports أثناء فحص التحديثات.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`/sw.js?v=${__BUILD_ID__}`, { scope: '/', updateViaCache: 'none' })
      .catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
