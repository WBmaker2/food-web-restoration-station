// 문서 Section 7.2 / 10.1 의 타입 계약.
// 화면 컴포넌트와 핵심 로직이 모두 참조하는 단일 타입 정의.

/** 생물 역할. 분해자(decomposer)는 포식 관계에 자동 연결하지 않는다. */
export type OrganismRole =
  | 'producer'
  | 'primaryConsumer'
  | 'secondaryConsumer'
  | 'apexConsumer'
  | 'decomposer';

/** 가상 서식지. MVP는 초원 하나만 사용. */
export type Habitat = 'grassland';

/** 학생이 보는 생물 카드 한 장. */
export type OrganismCard = {
  id: string;
  name: string;
  role: OrganismRole;
  /** 이모지/기호. 색이 안 보여도 역할을 알 수 있도록 아이콘+글자와 함께 표시. */
  icon: string;
  shortDescription: string;
  habitat: Habitat;
};

/** 먹이 관계. 화살표 규칙: foodId(먹힘) -> eaterId(먹음). */
export type FeedingRelation = {
  id: string;
  foodId: string;
  eaterId: string;
  clue: string;
  /** certain: 확정 관계, possible: 대체 먹이 후보 */
  confidence: 'certain' | 'possible';
};

/** 개체수 수준. 연속 수학 모델이 아닌 세 단계 상태 모델. */
export type PopulationLevel = 'low' | 'medium' | 'high';

export type PopulationState = {
  organismId: string;
  level: PopulationLevel;
};

/** 사건이 일으키는 변화. */
export type ChangeKind = 'increase' | 'decrease' | 'disappear';

/** 한 생물에 대한 변화 사건의 발동 조건. */
export type ChangeTrigger = {
  organismId: string;
  change: ChangeKind;
};

/** 영향 종류. decrease-possible 은 '줄 수는 있지만 단정할 수 없음'. */
export type Influence =
  | 'increase'
  | 'decrease'
  | 'decrease-possible'
  | 'uncertain'
  | 'no-direct-change';

/** 영향 판정 결과 한 건. */
export type InfluenceResult = {
  organismId: string;
  level: PopulationLevel;
  influence: Influence;
  reasons: string[];
  /** 사건 대상으로부터의 관계 거리. 0=대상 본인, 1=직접, 2이상=간접. */
  distance: number;
};

/** 변화 사건 미션. */
export type ChangeScenario = {
  id: string;
  title: string;
  trigger: ChangeTrigger;
  fixedConditions: string[];
  expectedRelations: string[];
  acceptableExplanations: string[];
};
