import type { FeedingRelation } from './types';

// 가상 초원의 먹이 관계 단서.
// 화살표 규칙: foodId(먹히는 생물) -> eaterId(먹는 생물).
// 분해자(mushroom)는 포식 관계에 넣지 않는다 (문서 5.4, 10.1-6).
// confidence:
//   - certain: 이 가상 초원에서 확정하는 관계
//   - possible: 대체 먹이 후보 (단정적 사라짐을 막기 위해 사용)

export const FEEDING_RELATIONS: FeedingRelation[] = [
  // ── 미션 0/1 의 핵심 사슬 ──
  { id: 'r-grass-grasshopper', foodId: 'grass', eaterId: 'grasshopper', clue: '메뚜기는 풀잎을 갉아먹는 흔적을 남겨요.', confidence: 'certain' },
  { id: 'r-grasshopper-frog', foodId: 'grasshopper', eaterId: 'frog', clue: '개구리 배 속에서 메뚜기가 자주 발견돼요.', confidence: 'certain' },
  { id: 'r-frog-snake', foodId: 'frog', eaterId: 'snake', clue: '뱀은 개구리를 통째로 삼키는 일이 많아요.', confidence: 'certain' },
  { id: 'r-snake-hawk', foodId: 'snake', eaterId: 'hawk', clue: '매의 둥지 근처에서 뱀 뼈가 발견돼요.', confidence: 'certain' },

  // ── 메뚜기→뱀 (뱀도 메뚜기를 먹는 대체 관계) ──
  { id: 'r-grasshopper-snake', foodId: 'grasshopper', eaterId: 'snake', clue: '어린 뱀은 메뚜기 같은 곤충도 잡아먹어요.', confidence: 'possible' },

  // ── 풀/들꽃 → 초식동물 ──
  { id: 'r-grass-rabbit', foodId: 'grass', eaterId: 'rabbit', clue: '토끼가 풀을 뜯어먹은 자리가 있어요.', confidence: 'certain' },
  { id: 'r-flower-rabbit', foodId: 'flower', eaterId: 'rabbit', clue: '토끼는 어린 들꽃 줄기도 먹어요.', confidence: 'possible' },
  { id: 'r-grass-vole', foodId: 'grass', eaterId: 'vole', clue: '들쥐는 풀과 씨앗을 모아 먹어요.', confidence: 'certain' },
  { id: 'r-flower-beetle', foodId: 'flower', eaterId: 'beetle', clue: '작은 곤충이 들꽃 꽃잎을 갉아먹어요.', confidence: 'certain' },

  // ── 2차/상위 소비자 ──
  { id: 'r-vole-snake', foodId: 'vole', eaterId: 'snake', clue: '뱀은 들쥐도 쫓아 잡아요.', confidence: 'certain' },
  { id: 'r-beetle-frog', foodId: 'beetle', eaterId: 'frog', clue: '개구리는 작은 곤충도 잡아먹어요.', confidence: 'possible' },
  { id: 'r-rabbit-weasel', foodId: 'rabbit', eaterId: 'weasel', clue: '족제비는 어린 토끼를 사냥해요.', confidence: 'possible' },
  { id: 'r-vole-weasel', foodId: 'vole', eaterId: 'weasel', clue: '족제비의 주요 먹이는 들쥐예요.', confidence: 'certain' },
  { id: 'r-rabbit-fox', foodId: 'rabbit', eaterId: 'fox', clue: '여우는 토끼를 추격해 잡아요.', confidence: 'certain' },
  { id: 'r-vole-fox', foodId: 'vole', eaterId: 'fox', clue: '여우는 들쥐도 많이 잡아요.', confidence: 'possible' },
  { id: 'r-rabbit-hawk', foodId: 'rabbit', eaterId: 'hawk', clue: '매는 작은 토끼도 사냥해요.', confidence: 'possible' },
];

/** id -> 관계 조회. */
export const RELATION_BY_ID: Record<string, FeedingRelation> = Object.fromEntries(
  FEEDING_RELATIONS.map((r) => [r.id, r]),
);

export function getRelation(id: string): FeedingRelation | undefined {
  return RELATION_BY_ID[id];
}
