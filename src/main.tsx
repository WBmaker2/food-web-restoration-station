import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FoodWebRestorationApp } from './features/food-web-restoration/FoodWebRestorationApp';
import './styles/food-web-restoration.css';
import './styles/a11y.css';

// 서버 없는 SPA 진입점. 새로고침 시 초기화(저장 없음).
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root 가 없습니다.');

createRoot(rootEl).render(
  <StrictMode>
    <FoodWebRestorationApp />
  </StrictMode>,
);
