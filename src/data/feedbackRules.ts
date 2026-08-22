import type { ChangeKind } from './types';
import type { AddLinkResult } from '../lib/foodWebGraph';

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

/** 관계 연결 결과를 모든 UI가 같은 문장으로 보여 주도록 공유한다. */
export function describeAddLinkResult(res: AddLinkResult): string {
  if (res.ok) return '연결했어요. 화살표는 먹히는 생물에서 먹는 생물 쪽이에요.';
  switch (res.reason) {
    case 'duplicate':
      return '이미 연결한 관계예요. 한 번만 저장해요.';
    case 'self-loop':
      return '자기 자신을 먹는 연결은 할 수 없어요.';
    case 'decomposer':
      return '분해자는 죽은 생물과 유기물을 분해하는 역할을 해요. 포식 관계에 넣지 않아요.';
    case 'reversed':
      return '화살표는 먹히는 생물에서 먹는 생물 쪽으로 그려요. 방향을 확인해 보세요.';
    default:
      return '이 두 생물은 이 미션의 먹이 관계 후보에 없어요. 단서를 다시 읽어보세요.';
  }
}

/** 근거 문장 틀(Section 11.2). 빈 칸 채우기용.
 *  slot 이름 뒤에 '_i'(이/가), '_e'(은/는), '_ul'(을/를), '_w'(와/과) 접미사가 붙으면
 *  해당 변수의 받침에 맞춘 조사 결합형으로 치환된다(예: {food_i} → '풀이' / '메뚜기가'). */
export type ReasoningTemplate = { id: string; template: string; slots: string[] };

/**
 * 변화 종류(change)에 맞는 근거 문장 템플릿 세트.
 * 사건의 맥락(증가/감소/사라짐)과 어긋나지 않도록 앞부분이 동적으로 바뀐다.
 * 예: 증가 사건 → "풀이 늘어나면...", 감소 사건 → "메뚜기가 줄어들면..."
 */
const TEMPLATES_BY_CHANGE: Record<ChangeKind, ReasoningTemplate[]> = {
  increase: [
    {
      id: 'tpl-food-shortage',
      // 사건 생물이 늘어나면: 그것을 먹는 생물은 먹이가 늘어난다
      template: '{food_i} 늘어나면 {eater_e} 먹이가 늘어나 {dir} 수 있습니다.',
      slots: ['food', 'eater', 'dir'],
    },
    {
      id: 'tpl-predation-release',
      // 포식자가 늘면 먹이는 포식 압력이 늘어 줄어들 수 있다
      template: '{predator_i} 늘어나면 {prey_i} 먹던 {food_e} 포식 압력이 늘어나 {dir} 수 있습니다.',
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
  ],
  decrease: [
    {
      id: 'tpl-food-shortage',
      // 사건 생물이 줄면: 그것을 먹는 생물은 먹이가 줄어든다
      template: '{food_i} 줄어들면 {eater_e} 먹이가 줄어 {dir} 수 있습니다.',
      slots: ['food', 'eater', 'dir'],
    },
    {
      id: 'tpl-predation-release',
      // 포식자가 줄면 먹이는 포식 압력이 줄어 늘어날 수 있다
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
  ],
  disappear: [
    {
      id: 'tpl-food-shortage',
      // 사건 생물이 사라지면: 그것을 먹는 생물은 먹이가 줄어든다
      template: '{food_i} 사라지면 {eater_e} 먹이가 줄어 {dir} 수 있습니다.',
      slots: ['food', 'eater', 'dir'],
    },
    {
      id: 'tpl-predation-release',
      // 포식자가 사라지면 먹이는 포식 압력이 줄어 늘어날 수 있다
      template: '{predator_i} 사라지면 {prey_i} 먹던 {food_e} 포식 압력이 줄어 {dir} 수 있습니다.',
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
  ],
};

/** 변화 종류에 맞는 템플릿 목록을 반환. 기본값은 decrease. */
export function getReasoningTemplates(change: ChangeKind): ReasoningTemplate[] {
  return TEMPLATES_BY_CHANGE[change] ?? TEMPLATES_BY_CHANGE.decrease;
}

/** 하위 호환: 모든 템플릿(decrease 기준). */
export const REASONING_TEMPLATES = TEMPLATES_BY_CHANGE.decrease;

/** 변화 방향 선택지(빈 칸 채우기용). 관형사형으로 뒤에 오는 말과 자연스럽게 결합.
 *  예: "{dir} 수 있습니다" → "늘어날 수 있습니다" / "줄어들 수 있습니다" / "변화가 없을 수 있습니다" */
export const DIRECTION_OPTIONS = ['늘어날', '줄어들', '변화가 없을'] as const;

/** 근거 문장 템플릿을 실제 값으로 채운 문장으로 렌더링한다.
 *  PredictionPanel(미리보기/추가)과 ResultCard(복사 텍스트)가 공유.
 *  slot 이름에 _i, _e, _ul, _w 접미사가 붙으면 받침-aware 조사 결합형을 만든다. */
export function renderReasoningSentence(
  templateId: string,
  filled: Record<string, string>,
  change: ChangeKind = 'decrease',
): string {
  const tpl = getReasoningTemplates(change).find((t) => t.id === templateId);
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
