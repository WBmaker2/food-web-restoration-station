/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 서버 없는 SPA. 새로고침 시 초기화, 외부 자료/이미지 없음.
// base 는 CLI --base 플래그로 제어한다.
//  - 로컬 dev/build: 기본 '/'
//  - Pages 배포: npm run build:pages -> --base=/food-web-restoration-station/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
