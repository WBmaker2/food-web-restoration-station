# 교육용 웹앱 UX 감사 장부

## 감사 범위

| 항목 | 내용 |
|---|---|
| 모드 | `full` |
| 대상 | `food-web-restoration-station` · 초등 5~6학년 과학 |
| 감사일 | 2026-08-31 |
| 기준 공개 화면 | https://wbmaker2.github.io/food-web-restoration-station/ |
| Stage 0 | `ready` |
| UI/UX 라우팅 | `design-system` · runtime-available |
| 브라우저 근거 | Playwright 실제 렌더링 · 1280×900, 375×812, 320×800 |
| 제외 | VoiceOver 구현·검증 |

## 실제 렌더링 기준선

- 시작 화면 제목과 시작 CTA는 1280×900에서 보였고, 문서 가로 폭은 viewport 안에 있었습니다. 근거: `.playwright-mcp/page-2026-08-31T10-18-33-110Z.yml`, `scrollWidth=1265`, `clientWidth=1265`.
- 미션 1은 `관계 단서`와 카드 선택 흐름을 보여 주며, 잘못된 순서로 `메뚜기 → 풀`을 선택하면 “화살표는 먹히는 생물에서 먹는 생물 쪽”이라는 회복 피드백을 표시했습니다. 근거: `.playwright-mcp/page-2026-08-31T10-19-37-719Z.yml`.
- 미션 5를 시작 화면 하단에서 선택한 375×812 경로에서는 `scrollY=723.5`로 남았고, 새 미션의 헤더가 viewport 위로 사라졌습니다. 근거: `.playwright-mcp/page-2026-08-31T10-19-56-119Z.yml` 및 브라우저 `scrollY` 측정.
- 관계를 한 개만 복원한 미션 1에서도 `다음: 변화 예측하기 (1/4) →` 버튼이 활성화되었습니다. 근거: `.playwright-mcp/page-2026-08-31T10-25-18-784Z.yml`.
- 복원 단계에서 예측 단계로 이동할 때 이전 스크롤 위치가 유지되어 1280px에서도 새 단계 헤더가 `y=-886`에 놓였습니다. 근거: `.playwright-mcp/page-2026-08-31T10-21-03-781Z.yml`.
- 320px 결과 표는 전체 폭 247px 안에 들어오지만 열 폭이 `40/31/55/88/31px`로 압축되고, `늘어날 수 있음`·`간접 영향(불확실)`이 여러 줄로 쪼개졌습니다. 표 자체의 가로 넘침은 없었습니다.
- 320px에서 `건너 연결` 용어 풀이를 열면 도움말 상자가 `x=-52`부터 시작해 왼쪽이 잘렸습니다. 근거: `.playwright-mcp/page-2026-08-31T10-25-49-719Z.yml`.
- 키보드 기준선에서는 `Tab` 1회 건너뛰기 링크 → 시작 CTA → 상세 설명 → 미션 버튼 → 설정 순서가 관찰되었고, 포커스 대상의 이름과 위치가 확인되었습니다. 근거: 2026-08-31 브라우저 Tab probe.
- 콘솔 오류는 0건이었고, 실패한 동적 네트워크 요청도 관찰되지 않았습니다.

## 수용 점수 기준선

| 영역 | 배점 | 기준선 | 근거 요약 |
|---|---:|---:|---|
| 학습 목표·과제 명료성 | 15 | 12 | 목표와 단계는 보이지만 미션 1 조건이 정답 경로를 직접 제시함 |
| 언어적 가독성·인지부하 | 20 | 14 | 문장은 대체로 짧지만 먹이사슬/먹이망 혼용, 모델 표현, 빈 문장 추가가 남음 |
| 화면 구조·행동 위계 | 12 | 7 | 단계 위계는 있으나 전환 후 스크롤 유지로 새 단계가 사라짐 |
| 피드백·오류 회복 | 13 | 10 | 관계 오답·다시하기는 좋지만 예측을 건너뛸 수 있음 |
| 시각적 가독성 | 10 | 7 | 대비·간격은 안정적이나 320px 결과 표가 지나치게 압축됨 |
| 키보드·의미·기본 접근성 | 10 | 8 | 의미 있는 버튼·포커스는 있으나 단계 전환 포커스와 모바일 용어 도움말 보완 필요 |
| 반응형 학습 흐름 | 10 | 6 | 가로 넘침은 없지만 미션 진입·단계 전환·결과 표의 모바일 흐름이 불안정함 |
| 런타임 안정성 | 5 | 5 | 공개 화면 제목·자산·콘솔·요청 기준선 양호 |
| 맥락적 시각자료·자산 안전 | 5 | 4 | DOM/SVG 관계 그래프와 이모지가 목적에 맞고 사실 근거로 과장되지 않음 |
| **합계** | **100** | **73** | 해결되지 않은 P1이 있어 `fail` |

## 이슈 장부

### EDU-UX-001

| 필드 | 내용 |
|---|---|
| Severity | **P1** |
| Title | 미션·단계 전환 뒤 이전 스크롤 위치가 유지되어 새 안내가 숨겨짐 |
| Path/state | 시작 화면 하단의 미션 5 선택 → 미션 복원 / 복원 → 예측 |
| Persona/viewport | 초5~6 서윤 / 375×812, 320×800, 1280×900 |
| Observed action/result | 미션 5 진입 뒤 `scrollY=723.5`, 헤더가 `y=-713`; 예측 전환 뒤 헤더가 `y=-886` |
| Evidence | `.playwright-mcp/page-2026-08-31T10-19-56-119Z.yml`, `.playwright-mcp/page-2026-08-31T10-21-03-781Z.yml` |
| Learner impact | 사건·현재 단계·다음 행동을 놓친 채 중간 화면에서 시작해 방향을 잃을 수 있음 |
| Root-cause hypothesis | 화면/미션/phase 상태 변경에 대한 scroll reset과 새 제목 focus 관리가 없음 |
| Proposed change | 미션·phase 변경 때 top으로 이동하고 현재 미션 제목에 programmatic focus를 둠 |
| Verification | 같은 시작 위치에서 미션 5·미션 1 복원→예측을 다시 실행하고 `scrollY=0`, 제목 visible을 확인 |
| Status | resolved; phase/mission change scroll reset + heading focus implemented, mobile E2E passed |

### EDU-UX-002

| 필드 | 내용 |
|---|---|
| Severity | **P1** |
| Title | 복원하지 않은 관계가 있어도 정답 그래프가 다음 단계에서 노출됨 |
| Path/state | 미션 1 복원 → 관계 1개 연결 |
| Persona/viewport | 초5~6 서윤 / 1280×900 |
| Observed action/result | 화면에 `다음: 변화 예측하기 (1/4) →`가 활성화됨. 다음 화면은 `scenarioLinks` 전체를 보여 주므로 남은 정답을 바로 확인할 수 있음 |
| Evidence | `.playwright-mcp/page-2026-08-31T10-25-18-784Z.yml`, `FoodWebRestorationApp.tsx`의 `canAdvance`와 예측 화면 렌더링 |
| Learner impact | 단서 해석과 관계 복원이라는 핵심 과제를 건너뛰고 예측 화면에서 답을 확인하게 됨 |
| Root-cause hypothesis | 영향 미션의 전진 조건이 `links.length > 0`으로만 설정됨 |
| Proposed change | 모든 기대 관계가 맞을 때만 예측 단계로 이동하고, 미완료 상태에는 남은 수와 다음 행동을 안내 |
| Verification | 관계 1개에서 버튼 disabled, 4개 완성에서 enabled, 예측 화면의 graph 노출 순서를 재확인 |
| Status | resolved; incomplete restore disabled and complete 4/4 enabled in E2E |

### EDU-UX-003

| 필드 | 내용 |
|---|---|
| Severity | **P2** |
| Title | 320px 결과 표의 열이 너무 좁아 비교 문장이 분절됨 |
| Path/state | 미션 1 → 결과 비교 / 미예측 상태 |
| Persona/viewport | 초5~6 서윤 / 320×800 |
| Observed action/result | 표 폭 247px, 셀 폭 일부 31~55px; 영향 라벨이 여러 줄로 쪼개짐 |
| Evidence | 320px browser snapshot 및 `table.getBoundingClientRect()` 측정 |
| Learner impact | ‘내 예측/가상 결과/비교’ 관계를 한눈에 대조하기 어려움 |
| Root-cause hypothesis | 데스크톱 5열 표를 작은 화면에서도 동일한 열 구조로 유지함 |
| Proposed change | 모바일에서는 각 생물을 한 장의 세로 비교 행으로 바꾸고 `data-label`로 항목 이름을 반복 표시 |
| Verification | 같은 미션 결과를 320/375px에서 읽을 수 있는 세로 행으로 확인하고 document 가로 넘침 유지 여부 확인 |
| Status | resolved; 320px result table reflow and no-overflow assertion passed |

### EDU-UX-004

| 필드 | 내용 |
|---|---|
| Severity | **P2** |
| Title | 모바일 용어 도움말이 viewport 왼쪽 밖으로 잘림 |
| Path/state | 예측 단계 → `건너 연결` 도움말 열기 |
| Persona/viewport | 초5~6 서윤 / 320×800 |
| Observed action/result | 도움말 box가 `x=-52`에서 시작함 |
| Evidence | `.playwright-mcp/page-2026-08-31T10-25-49-719Z.yml` |
| Learner impact | `간접 영향`의 풀이를 읽지 못해 직접/간접 구분을 혼동할 수 있음 |
| Root-cause hypothesis | 데스크톱 중앙 정렬 tooltip을 모바일에서도 그대로 사용함 |
| Proposed change | 모바일 tooltip을 용어 버튼의 왼쪽 기준으로 배치하고 viewport 안에서 max-width를 제한 |
| Verification | 320/375px에서 tooltip의 left/right가 viewport 안인지 측정하고 텍스트 전체 표시 확인 |
| Status | resolved; viewport-positioned tooltip bounds assertion passed at 320px |

### EDU-UX-005

| 필드 | 내용 |
|---|---|
| Severity | **P2** |
| Title | 영향 거리를 `수준`으로 표시해 정보 의미가 어긋남 |
| Path/state | 예측·결과 그래프 카드 |
| Persona/viewport | 초5~6 서윤 / 1280×900 |
| Observed action/result | 카드에 `수준: 거리 1`, `수준: 거리 2`가 표시됨 |
| Evidence | `.playwright-mcp/page-2026-08-31T10-25-23-320Z.yml`, `FoodWebCanvas.tsx`, `OrganismCard.tsx` |
| Learner impact | 개체 수 수준과 사건으로부터의 관계 거리를 혼동할 수 있음 |
| Root-cause hypothesis | 일반적인 `level` prop과 CSS class를 거리 메타데이터에도 재사용함 |
| Proposed change | 시각 라벨을 `영향 거리: 1단계`처럼 명시하고 의미상 `meta` prop으로 분리 |
| Verification | 예측·결과 카드에서 거리 라벨과 aria 이름이 같은 뜻인지 확인 |
| Status | resolved; `meta` prop and `영향 거리: n단계` label implemented |

### EDU-UX-006

| 필드 | 내용 |
|---|---|
| Severity | **P2** |
| Title | 예측을 하나도 하지 않아도 결과 비교로 이동 가능함 |
| Path/state | 예측 단계 초기 상태 |
| Persona/viewport | 초5~6 서윤 / 1280×900, 320×800 |
| Observed action/result | `다음: 결과 비교하기 →`가 예측 선택 전에도 활성화되고 결과 표에 모든 행이 `예측 안 함`으로 표시됨 |
| Evidence | `.playwright-mcp/page-2026-08-31T10-25-23-320Z.yml` |
| Learner impact | 예측→관찰→수정의 학습 루프가 선택 없이 종료될 수 있음 |
| Root-cause hypothesis | result 전환에 prediction completeness 조건이 없음 |
| Proposed change | 먼저 예측하도록 표시한 직접 연결 생물의 선택을 모두 채울 때만 결과 CTA 활성화; 건너 연결 예측은 선택 사항으로 유지 |
| Verification | 직접 연결 선택 전 disabled, 모두 선택 후 enabled, 간접 선택은 optional임을 확인 |
| Status | resolved; direct prediction gate and blank-state recovery message implemented |

### EDU-UX-007

| 필드 | 내용 |
|---|---|
| Severity | **P2** |
| Title | 빈 칸 근거 문장이 그대로 저장됨 |
| Path/state | 예측 단계 → 근거 문장 만들기 → 초기값에서 `문장 추가` |
| Persona/viewport | 초5~6 서윤 / 1280×900 |
| Observed action/result | `___ 늘어나면 ___ 먹이가 늘어나 ___ 수 있습니다.`가 `(1개)` 문장으로 저장됨 |
| Evidence | `.playwright-mcp/page-2026-08-31T10-25-30-518Z.yml` |
| Learner impact | 근거를 작성했다는 표시만 남고 실제 설명은 비어 있어 회고 품질이 떨어짐 |
| Root-cause hypothesis | required slot 검증 없이 `onAdd`를 호출함 |
| Proposed change | 모든 선택 칸이 채워질 때까지 문장 추가를 disabled하고 짧은 안내를 표시 |
| Verification | 빈 상태에서 disabled, 모든 slot 선택 후 추가 가능, 저장 문장에 `___` 없음 |
| Status | resolved; empty sentence add disabled and helper text asserted in E2E |

## 구현 후 확인

| 확인 항목 | 결과 |
|---|---|
| 해결되지 않은 P0/P1 | 0개; EDU-UX-001·002 resolved |
| P2 개선 | EDU-UX-003~007 resolved in source review and browser regression |
| TypeScript | `npm run typecheck` 통과 |
| 단위 테스트 | 6개 파일, 55개 테스트 통과 |
| Pages build | `npm run build:pages` 통과 |
| Playwright | 격리한 4174 포트에서 2개 시나리오 통과. 이후 공식 설정 재실행은 macOS Chromium의 `MachPortRendezvous ... Permission denied` 시작 오류로 중단됨; 애플리케이션 assertion 실패는 아님 |
| 정적 점검 | `git diff --check` 통과, 500줄 이상 소스 파일 없음 |
| 수동 후속 | 교사·교과 검토, Safari 확인, VoiceOver는 범위 제외 |

기준선 점수 73점은 구현 전 관찰값이며, 해결 후에는 P1 fail 조건이 제거되었습니다. 새 점수의 공식 확정은 교사·교과 검토와 실제 수업 관찰 후로 남깁니다.

## P3 후속 후보

- 미션별로 실제 등장하는 영양 단계만 헤더에 표시하면 빈 상위 소비자 열을 줄일 수 있습니다.
- 시작 화면의 6개 미션 목록에 “순서대로 해도 좋아요”와 현재 진행 표시를 추가하는 것은 후속 UX 실험 후보입니다.
- 현재 DOM/SVG 관계 그래프가 학습 목표에 충분하므로 장식용 생성 이미지 추가는 보류합니다.
