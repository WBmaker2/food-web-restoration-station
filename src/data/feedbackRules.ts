// 문서 Section 11.1 선택 피드백 문장 + Section 11.2 근거 문장 틀.

/** 상황별 피드백 키 -> 문장. */
export const FEEDBACK_MESSAGES: Record<string, string> = {
  arrowReversed: '화살표는 먹히는 생물에서 먹는 생물 쪽으로 그려요.',
  directCorrect: '연결된 먹이 관계를 근거로 잘 찾았어요.',
  overDirect: '중간에 어떤 생물이 연결되어 있는지 한 단계씩 확인해 보세요.',
  ignoreAltFood: '이 생물에게 다른 먹이가 남아 있는지도 살펴보세요.',
  decomposerAsPredator: '분해자는 죽은 생물과 유기물을 분해하는 역할을 해요.',
  selectAll: '직접 연결된 생물부터 고르고, 연결되지 않은 생물은 근거가 있는지 확인하세요.',
};

/** 피드백 키 타입. */
export type FeedbackKey = keyof typeof FEEDBACK_MESSAGES;

/** 근거 문장 틀(Section 11.2). 빈 칸 채우기용. */
export const REASONING_TEMPLATES: { id: string; template: string; slots: string[] }[] = [
  {
    id: 'tpl-food-shortage',
    template: '{food}가 줄어들면 {eater}은(는) 먹이가 줄어 {dir}할 수 있습니다.',
    slots: ['food', 'eater', 'dir'],
  },
  {
    id: 'tpl-predation-release',
    template: '{predator}가 줄어들면 {prey}이(가) 먹던 {food}은(는) 포식 압력이 줄어 {dir}할 수 있습니다.',
    slots: ['predator', 'prey', 'food', 'dir'],
  },
  {
    id: 'tpl-alt-food',
    template: '{eater}은(는) 다른 먹이 {alt}도 있으므로 바로 사라진다고 단정하기 어렵습니다.',
    slots: ['eater', 'alt'],
  },
  {
    id: 'tpl-evidence',
    template: '이 예측의 근거는 {a}와(과) {b}의 연결입니다.',
    slots: ['a', 'b'],
  },
];

/** 변화 방향 선택지(빈 칸 채우기용). */
export const DIRECTION_OPTIONS = ['늘어', '줄어', '변하지 않'] as const;
