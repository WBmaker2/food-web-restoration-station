# 먹이망 연결 복원소

초등 5~6학년 과학 생태계 단원 교육용 웹앱. 가상 초원의 생물 카드로 먹이 관계를 복원하고, 한 생물의 개체 수 변화가 다른 생물에게 어떻게 이어지는지 추론하는 활동.

서버 없이 브라우저에서만 동작하며, 점수 게임이 아니라 **관계 구조 복원**과 **변화 방향의 근거 설명**에 집중한다.

## 실행

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run typecheck # TypeScript 검사
npm test -- --run # 단위 테스트 (Vitest)
npm run test:e2e  # 브라우저 학생 흐름 (Playwright)
npm run build:pages # GitHub Pages용 서브경로 빌드
```

## 주요 특징

- **화살표 규칙 고정**: 먹히는 생물 → 먹는 생물 (예: 풀 → 메뚜기 → 개구리)
- **6개 미션**: 화살표 방향 훈련 → 기본 먹이망 → 감소/사라짐/증가 사건 → 대체 먹이
- **화면별 연결 방식**: 큰 화면은 생물 카드 두 장 선택, 작은 화면은 3단계 버튼 흐름
- **직·간접 영향 구분**: 사건 대상으로부터의 관계 거리(distance)로 직접(1단계)·간접(2단계+) 분리
- **대체 먹이**: 먹이가 여러 종이면 단정적 사라짐을 막고 `decrease-possible`로 처리
- **분해자 보호**: 분해자를 포식 관계에 자동 연결하지 않음
- **접근성**: 색만으로 구분하지 않음(아이콘+글자+선 모양 병용), 44px 터치 영역, 키보드 조작, 모션 줄이기, 작은 화면 단계형 연결 모드
- **업데이트 내역**: 시작 화면과 미션 헤더에서 개선 날짜와 내용을 확인
- **서버 없는 실행**: 외부 폰트에 의존하지 않아 핵심 화면이 오프라인 환경에서도 열림

## 구조

```
src/
  data/        타입·생물 카드·먹이 관계·미션·피드백
  lib/         foodWebGraph(관계 그래프) · influenceEngine(영향 판정) · accessibilityLabels
  features/    UI 컴포넌트 + useFoodWebState
  styles/      food-web-restoration.css · food-web-restoration-panels.css · food-web-restoration-terms.css · a11y.css
e2e/           Playwright 학생 흐름 테스트
docs/          승인된 개선 계획과 실행 기록
.github/       테스트 및 GitHub Pages 배포 워크플로우
```

## 비고

- 모든 생물·관계는 **"이 가상 초원의 규칙"** 이며, 실제 자연 전체를 재현한 것이 아니다.
- 실제 학급 적용 전 교과서·교사 과학 검수가 필요하다.
- 새로고침 시 초기화되며 개인 데이터를 저장하지 않는다.
- 누적 구현·검증 범위와 단계별 개선 기록은 [`docs/2026-08-22-food-web-restoration-improvement-plan.md`](docs/2026-08-22-food-web-restoration-improvement-plan.md)에, 2026-08-31 UX 감사와 적용 결과는 [`work/elementary-webapp-ux-report.md`](work/elementary-webapp-ux-report.md)에 기록한다.

## 라이선스

교육용 MVP. 별도 라이선스 명시 전에는 교육적 목적의 사용을 전제로 한다.
