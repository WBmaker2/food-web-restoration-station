# 테스트 및 검증 안내

## 테스트 원칙

핵심 학습 흐름을 빠르게 바꾸려면 계산 로직과 브라우저 상호작용을 함께 검증해야 합니다. 새로운 조건 분기에는 양쪽 경로를 확인하고, 버그를 수정할 때는 같은 문제가 다시 생기지 않는 회귀 테스트를 추가합니다.

## 실행 명령

```bash
npm test -- --run   # Vitest 단위 테스트
npm run typecheck   # TypeScript 검사
npm run build       # 일반 프로덕션 빌드
npm run test:e2e    # Playwright 브라우저 흐름
```

GitHub Pages 배포 workflow는 의존성 설치 후 타입 검사, 단위 테스트, Playwright 브라우저 테스트, Pages용 빌드 순서로 실행됩니다.

## 테스트 계층

- 단위 테스트: `src/**/*.test.ts`, 그래프·영향 엔진·한국어 조사·근거 문장
- 상태 계약 테스트: `useFoodWebState.test.ts`, 시나리오 기준 관계 변환
- 브라우저 E2E: `e2e/food-web-restoration.spec.ts`, 데스크톱·375px 모바일 학생 흐름
- 수동 확인: 전자칠판 폭, 실제 화면 낭독기, Safari/Chrome 차이, 교사 콘텐츠 검수

## 브라우저 E2E 범위

```text
시작 → 업데이트 내역 → 미션 1 → 카드 두 장 연결
  → 예측 → 결과 → 다시하기 상태 초기화

375px → 미션 5 → 단계형 연결 → 부분 연결 피드백 → 가로 오버플로 확인
```

로컬 Playwright 브라우저가 설치되지 않았거나 macOS 권한으로 실행할 수 없으면 단위·타입·빌드 결과와 브라우저 수동 확인 결과를 분리해 기록합니다.
