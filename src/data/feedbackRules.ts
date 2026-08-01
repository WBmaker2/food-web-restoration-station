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

/** 근거 문장 틀(Section 11.2). 빈 칸 채우기용.
 *  slot 이름 뒤에 '_i'(이/가), '_e'(은/는), '_ul'(을/를), '_wa'(와/과) 접미사가 붙으면
 *  해당 변수의 받침에 맞춘 조사 결합형으로 치환된다(예: {food_i} → '풀이' / '메뚜기가'). */
export const REASONING_TEMPLATES: { id: string; template: string; slots: string[] }[] = [
  {
    id: 'tpl-food-shortage',
    template: '{food_i} 줄어들면 {eater_e} 먹이가 줄어 {dir} 수 있습니다.',
    slots: ['food', 'eater', 'dir'],
  },
  {
    id: 'tpl-predation-release',
    template: '{predator_i} 줄어들면 {prey_i} 먹던 {food_e} 포식 압력이 줄어 {dir} 수 있습니다.',
    slots: ['predator', 'prey', 'food', 'dir'],
  },
  {
    id: 'tpl-alt-food',
    template: '{eater_e} 다른 먹이 {alt}도 있으므로 바로 사라진다고 단정하기 어렵습니다.',
    slots: ['eater', 'alt'],
  },
  {
    id: 'tpl-evidence',
    template: '이 예측의 근거는 {a_w} {b}의 연결입니다.',
    slots: ['a', 'b'],
  },
];

/** 변화 방향 선택지(빈 칸 채우기용). 관형사형으로 뒤에 오는 말과 자연스럽게 결합.
 *  예: "{dir} 수 있습니다" → "늘어날 수 있습니다" / "줄어들 수 있습니다" / "변화가 없을 수 있습니다" */
export const DIRECTION_OPTIONS = ['늘어날', '줄어들', '변화가 없을'] as const;

/** 근거 문장 템플릿을 실제 값으로 채운 문장으로 렌더링한다.
 *  PredictionPanel(미리보기/추가)과 ResultCard(복사 텍스트)가 공유.
 *  slot 이름에 _i, _e, _ul, _wa 접미사가 붙으면 받침-aware 조사 결합형을 만든다. */
export function renderReasoningSentence(
  templateId: string,
  filled: Record<string, string>,
): string {
  const tpl = REASONING_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return '';
  // {name} 또는 {name_suffix} 매칭. _ 로 변수명과 접미사를 분리.
  return tpl.template.replace(/\{([a-zA-Z]+)(?:_([a-zA-Z]))?\}/g, (_m, name: string, suffix?: string) => {
    const value = filled[name];
    if (!value) return '___';
    const hasBatchim = batchimOf(value);
    if (suffix === 'i') return hasBatchim ? `${value}이` : `${value}가`;
    if (suffix === 'e') return hasBatchim ? `${value}은` : `${value}는`;
    if (suffix === 'ul') return hasBatchim ? `${value}을` : `${value}를`;
    if (suffix === 'w') return hasBatchim ? `${value}과` : `${value}와`;
    return value;
  });
}

/** 마지막 한글 글자에 받침이 있는지. */
function batchimOf(value: string): boolean {
  const last = value.trim().slice(-1);
  const code = last.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
}
