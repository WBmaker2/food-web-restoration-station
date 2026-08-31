import type { ChangeKind, ChangeScenario, PopulationLevel } from './types';

// 미션 0~5 의 변화 사건 정의.
// 모든 사건은 '이 미션의 조건에서는' 프레이밍을 함께 표시한다 (문서 10.2).
// expectedRelations: 학생이 연결해야 할 관계 id 목록 (화살표 복원의 정답 기준).
// choiceRelationIds: 학습자가 읽고 선택할 수 있는 정답·오답 관계 후보.
// acceptableExplanations: 근거 문장으로 부분 인정할 설명 키워드.

export const CHANGE_SCENARIOS: ChangeScenario[] = [
  {
    id: 'mission-0-arrow',
    title: '미션 0: 화살표 방향 훈련',
    learningMode: 'arrow',
    trigger: { organismId: 'grass', change: 'increase' },
    fixedConditions: ['이 가상 초원에서는 화살표 규칙이 하나뿐이에요.'],
    expectedRelations: ['r-grass-grasshopper', 'r-grasshopper-frog'],
    choiceRelationIds: ['r-grass-grasshopper', 'r-grasshopper-frog'],
    acceptableExplanations: ['방향', '먹히는', '먹는'],
  },
  {
    id: 'mission-1-three-chains',
    title: '미션 1: 기본 먹이망 복원',
    learningMode: 'impact',
    trigger: { organismId: 'grass', change: 'increase' },
    fixedConditions: [
      '이 가상 초원에서는 생산자가 풀 하나뿐이에요.',
      '단서를 이어 여러 먹이사슬이 하나의 먹이망이 되는 모습을 살펴봐요.',
    ],
    expectedRelations: [
      'r-grass-grasshopper',
      'r-grasshopper-frog',
      'r-frog-snake',
      'r-snake-hawk',
    ],
    choiceRelationIds: [
      'r-grass-grasshopper',
      'r-grasshopper-frog',
      'r-frog-snake',
      'r-snake-hawk',
      'r-grasshopper-snake',
    ],
    acceptableExplanations: ['여러 사슬', '공통', '하나의 망'],
  },
  {
    id: 'mission-2-grasshopper-down',
    title: '미션 2: 메뚜기 감소 사건',
    learningMode: 'impact',
    trigger: { organismId: 'grasshopper', change: 'decrease' },
    fixedConditions: [
      '이 미션의 조건에서는 메뚜기가 풀만 먹고 살아요.',
      '개구리와 뱀이 메뚜기를 먹어요.',
    ],
    expectedRelations: [
      'r-grass-grasshopper',
      'r-grasshopper-frog',
      'r-grasshopper-snake',
    ],
    choiceRelationIds: [
      'r-grass-grasshopper',
      'r-grasshopper-frog',
      'r-grasshopper-snake',
      'r-frog-snake',
    ],
    acceptableExplanations: ['먹이 부족', '포식 압력', '줄어들 수'],
  },
  {
    id: 'mission-3-snake-gone',
    title: '미션 3: 뱀 사라짐 사건',
    learningMode: 'impact',
    trigger: { organismId: 'snake', change: 'disappear' },
    fixedConditions: [
      '이 미션의 조건에서는 뱀이 잠시 사라졌어요.',
      '매의 다른 먹이는 이 미션에서 따로 없어요.',
    ],
    expectedRelations: [
      'r-frog-snake',
      'r-vole-snake',
      'r-snake-hawk',
    ],
    choiceRelationIds: [
      'r-frog-snake',
      'r-vole-snake',
      'r-snake-hawk',
      'r-rabbit-hawk',
    ],
    acceptableExplanations: ['포식 압력 감소', '늘어날 수', '먹이 선택지'],
  },
  {
    id: 'mission-4-flower-up',
    title: '미션 4: 들꽃 증가와 토끼·곤충 변화',
    learningMode: 'impact',
    trigger: { organismId: 'flower', change: 'increase' },
    fixedConditions: [
      '이 미션의 조건에서는 풀과 들꽃이 모두 생산자예요.',
      '들꽃이 늘어도 풀을 좋아하는 생물이 똑같이 늘지는 않아요.',
    ],
    expectedRelations: [
      'r-flower-beetle',
      'r-flower-rabbit',
      'r-beetle-frog',
    ],
    choiceRelationIds: [
      'r-flower-beetle',
      'r-flower-rabbit',
      'r-beetle-frog',
      'r-grass-rabbit',
    ],
    acceptableExplanations: ['생산자가 달라', '모든 소비자가 같진 않'],
  },
  {
    id: 'mission-5-alt-food',
    title: '미션 5: 대체 먹이가 있는 복원 사건',
    learningMode: 'impact',
    trigger: { organismId: 'grasshopper', change: 'decrease' },
    fixedConditions: [
      '이 미션의 조건에서는 개구리가 메뚜기와 작은 곤충을 모두 먹어요.',
      '메뚜기가 줄어도 작은 곤충이 남아 있어요.',
    ],
    expectedRelations: [
      'r-grass-grasshopper',
      'r-grasshopper-frog',
      'r-beetle-frog',
    ],
    choiceRelationIds: [
      'r-grass-grasshopper',
      'r-grasshopper-frog',
      'r-beetle-frog',
      'r-flower-beetle',
    ],
    acceptableExplanations: ['대체 먹이', '관계 수', '바로 사라진다고 단정'],
  },
];

export const SCENARIO_BY_ID: Record<string, ChangeScenario> = Object.fromEntries(
  CHANGE_SCENARIOS.map((s) => [s.id, s]),
);

/** 사건 변화 종류 한글 표현. */
export const CHANGE_LABEL: Record<ChangeKind, string> = {
  increase: '많아짐',
  decrease: '줄어듦',
  disappear: '사라짐',
};

/** 개체수 수준 한글 라벨. */
export const LEVEL_LABEL: Record<PopulationLevel, string> = {
  low: '적음',
  medium: '보통',
  high: '많음',
};

/** 미션별 초기 개체수 상태. 사건 전 기준. */
export const INITIAL_POPULATIONS: Record<string, PopulationLevel> = {
  grass: 'high',
  flower: 'medium',
  grasshopper: 'high',
  rabbit: 'medium',
  vole: 'medium',
  beetle: 'medium',
  frog: 'medium',
  snake: 'medium',
  weasel: 'low',
  hawk: 'low',
  fox: 'low',
};
