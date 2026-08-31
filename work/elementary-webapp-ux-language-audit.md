# 학습자 문구 감사 장부

## 수집·검토 기준

- 자동 후보 수집: `work/elementary-webapp-ux-language-candidates.md` (2026-08-31 실행, 943개 후보, `triage only`). 테스트·개발자 문자열은 학생 화면 문구로 확정하지 않고 실제 브라우저 상태와 대조했습니다.
- 대상 학년: 초등 5~6학년. 핵심 교과 용어는 삭제하지 않고 처음 등장할 때 쉬운 풀이와 함께 유지합니다.
- 실제 상태: 시작, 미션 1 복원, 오답, 부분 복원, 예측, 근거 문장, 결과, 320/375px 모바일.
- 맞춤법 보조 검수: 바른한글 공개 검사기 기준으로 개선 예정 문구 묶음을 저빈도로 확인했으며 교정 제안은 없었습니다. 교과 정확성은 이 검사기가 대신하지 않으므로 가상 초원 규칙은 교사 검토 대상으로 유지합니다.

## 문구 장부

| issue-id | screen/state | surface | source/evidence | target grade | before | difficulty signals | after | learning intent preserved | curriculum terms and facts preserved | comprehension probe | visual readability link | verification state | status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EDU-LANG-001 | 시작 / 핵심 규칙 | instruction | `src/features/food-web-restoration/HabitatIntro.tsx:47`, 시작 snapshot | 5–6 | 단서를 읽고 카드를 연결해 **먹이사슬**을 만들어요. | inconsistent-label, factual-risk | 단서를 읽고 여러 **먹이사슬**을 이어 하나의 **먹이망**을 만들어요. | yes | yes; 사슬과 망의 차이를 보존 | 용어 설명·지시 재진술: 여러 줄이 연결되어 망이 된다고 말하고 미션을 시작하는가 | none | applied; intro route and source review complete | resolved |
| EDU-LANG-002 | 미션 1 복원 | fixed condition | `src/data/changeScenarios.ts:27`, 미션 1 snapshot | 5–6 | 풀 → 메뚜기 → 개구리 → 뱀 → 매의 연결을 먼저 살펴봐요. | factual-risk, missing-discovery | 여러 단서에서 찾은 연결을 이어, 여러 먹이사슬이 하나의 먹이망이 되는 모습을 살펴봐요. | yes | yes; 먹이망 형성 목표만 남기고 정답 순서는 삭제 | 지시 재진술: 단서를 먼저 읽고 카드 연결을 시도하는가 | none | applied; answer-leak regression passes | resolved |
| EDU-LANG-003 | 예측 단계 안내 | instruction | `src/features/food-web-restoration/ChangeScenarioPanel.tsx:30`, `PredictionPanel.tsx:47` | 5–6 | 연결한 관계를 보고… / 건너 연결은 가능성으로만 생각해 보세요. | ambiguous-reference, factual-risk | 이 미션의 먹이망을 보고… / 두 단계 이상 건너 연결은 가능성으로만 생각해 보세요. | yes | yes; 기준 먹이망과 간접 가능성 표현을 명시 | 용어 설명·결과 예측: ‘가상 결과’가 미션 조건 안의 계산임을 말하는가 | none | applied; predict gate and wording covered by browser regression | resolved |
| EDU-LANG-004 | 결과 단계 안내 | instruction | `src/features/food-web-restoration/ChangeScenarioPanel.tsx:31` | 5–6 | 내 예측과 **실제 결과**를 비교하고… | factual-risk | 내 예측과 **가상 결과**를 비교하고… | yes | yes; 실제 자연의 측정값으로 오해하지 않게 경계를 강화 | 결과 예측: 앱의 결과가 가상 초원 규칙에서 나온다는 것을 말하는가 | none | applied; result browser regression passes | resolved |
| EDU-LANG-005 | 예측 카드 | meta label | `src/features/food-web-restoration/FoodWebCanvas.tsx:189` | 5–6 | 수준: 거리 1 | ambiguous-reference, inconsistent-label | 영향 거리: 1단계 | yes | yes; 개체 수 수준과 관계 거리를 분리 | 용어 설명: ‘거리 1단계’를 바로 연결이라고 설명하는가 | EDU-UX-005 | applied; `meta` label source review and E2E route pass | resolved |
| EDU-LANG-006 | 근거 문장 / increase | field label | `PredictionPanel.tsx:153`, 실제 예측 패널 snapshot | 5–6 | 줄어든/없어진 생물 | inconsistent-label, factual-risk | 늘어난 생물 | yes | yes; 사건 종류와 문장 슬롯을 일치 | 지시 재진술: 풀이 늘어난 사건의 생물을 고르는가 | none | applied; increase route covered, decrease/disappear remain teacher spot-check candidates | follow-up |
| EDU-LANG-007 | 근거 문장 / empty | button, feedback | `PredictionPanel.tsx:146-197`, `.playwright-mcp/page-2026-08-31T10-25-30-518Z.yml` | 5–6 | 빈 칸이어도 `문장 추가`를 눌러 `___` 문장이 저장됨 | missing-recovery, ambiguous-reference | 빈 칸을 모두 고르면 문장을 추가할 수 있어요. 빈 상태의 추가 버튼은 disabled | yes | yes; 근거 선택을 선택 사항으로 유지하되 저장 문장은 완성 | 회복 행동: 비활성 이유를 읽고 선택 칸을 채우는가 | none | applied; disabled state asserted in E2E | resolved |
| EDU-LANG-008 | 결과 비교 / 미예측 | comparison cell | `ResultCard.tsx:47` | 5–6 | 예측 안 함 | ambiguous-reference, inconsistent-label | 아직 선택 안 함; 사건 대상은 사건에서 정함 | yes | yes; 사용자가 선택하지 않은 상태와 사건으로 정해진 상태를 분리 | 결과 예측: 어떤 행을 아직 선택하지 않았는지 말할 수 있는가 | EDU-UX-003 | applied; result table route passes | resolved |

## 유지한 문구와 이유

- `먹히는 생물 → 먹는 생물`: 앱의 핵심 화살표 규칙이므로 더 짧게 줄이지 않았습니다.
- `간접 영향`, `대체 먹이`, `분해자`, `포식 압력`: 교과 개념을 삭제하지 않고 `TermTip` 또는 문맥으로 풀이하는 방향을 유지합니다.
- `이 가상 초원의 조건에서…`: 실제 자연 전체를 재현하지 않는다는 모델 경계를 유지합니다.
- 관계 단서의 생태 사실은 이 앱의 가상 초원 규칙으로 한정되어 있으며, 실제 수업 전 교사·교과 검토가 필요합니다(`human-review`).

## 구현 후 상태

문구 변경 전 장부의 자동 후보는 실제 화면 후보 수집 자료로만 사용했습니다. 코드 적용 후 정상·오답·빈 입력·완료 상태를 로컬 브라우저 회귀와 소스 검토로 확인했습니다. 증가 사건은 E2E로 확인했고, 감소·사라짐 사건의 모든 문장 템플릿은 교사·교과 검토 후보로 남겼습니다. VoiceOver는 검증 범위에서 제외합니다.

| 구현 후 검증 | 결과 |
|---|---|
| 정답 경로 비노출 | 미션 1의 기존 화살표 문구 제거 및 E2E 회귀 확인 |
| 상태 경계 문구 | 복원·예측·결과 단계의 버튼/가이드 문구 확인 |
| 모바일 비교 문구 | 320px 결과 행의 `data-label` 표시 확인 |
