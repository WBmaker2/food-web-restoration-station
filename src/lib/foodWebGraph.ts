import type { FeedingRelation, OrganismCard } from '../data/types';
import { FOOD_WEB_ORGANISMS } from '../data/foodWebOrganisms';

// 먹이망 관계 그래프.
// 정답 판정은 카드 위치와 무관하게 관계 ID로 처리한다 (문서 12.2, 17.1).

/** 그래프에 추가된 연결(학생이 복원한 관계). */
export type RestoredLink = {
  relationId: string;
  foodId: string;
  eaterId: string;
};

/** 관계 추가 시 결과. UI가 사용자에게 줄 피드백을 구분한다. */
export type AddLinkResult =
  | { ok: true; link: RestoredLink }
  | { ok: false; reason: 'duplicate' | 'self-loop' | 'decomposer' | 'reversed' | 'unknown-relation' };

/** 안정적인 관계 ID 생성 (양방향 순서 정규화). */
function normalizePairId(a: string, b: string): string {
  return [a, b].sort().join('::');
}

/** 두 연결이 같은 먹이 쌍을 다루는지 (순서 무관). */
function samePair(x: RestoredLink, food: string, eater: string): boolean {
  return normalizePairId(x.foodId, x.eaterId) === normalizePairId(food, eater);
}

/** 역방향(반대) 관계가 이미 존재하는지. 화살표 방향 훈련 피드백에 사용. */
export function findReversed(links: RestoredLink[], food: string, eater: string): RestoredLink | undefined {
  // 역방향: 저장된 연결의 food/eater 가 인자의 eater/food 와 일치.
  return links.find((l) => l.foodId === eater && l.eaterId === food);
}

/** 해당 생물이 분해자인지. */
export function isDecomposer(organismId: string, pool: OrganismCard[] = FOOD_WEB_ORGANISMS): boolean {
  return pool.find((o) => o.id === organismId)?.role === 'decomposer';
}

/**
 * 관계를 그래프에 추가한다.
 * 검증 규칙(문서 17.1):
 *  - 모르는 관계 id 거부
 *  - 자기 자신을 먹는 연결 거부
 *  - 분해자는 포식 관계에 자동 연결하지 않음
 *  - 역방향이 이미 있으면 reversed 로 알림(학생이 방향을 바꾸도록 유도)
 *  - 중복은 한 번만 저장
 * 정답 판정은 relationId 기반이라 카드 위치가 바뀌어도 유지된다.
 */
export function addLink(
  links: RestoredLink[],
  relationId: string,
  relations: FeedingRelation[],
): AddLinkResult {
  const rel = relations.find((r) => r.id === relationId);
  if (!rel) return { ok: false, reason: 'unknown-relation' };

  const { foodId, eaterId } = rel;

  if (foodId === eaterId) return { ok: false, reason: 'self-loop' };
  if (isDecomposer(foodId) || isDecomposer(eaterId)) {
    return { ok: false, reason: 'decomposer' };
  }

  // 역방향이 있으면 먼저 알림(학생이 방향을 점검하도록).
  const reversed = findReversed(links, foodId, eaterId);
  if (reversed) return { ok: false, reason: 'reversed' };

  // 같은 쌍 중복은 한 번만.
  if (links.some((l) => l.relationId === relationId || samePair(l, foodId, eaterId))) {
    return { ok: false, reason: 'duplicate' };
  }

  const link: RestoredLink = { relationId, foodId, eaterId };
  return { ok: true, link };
}

/** 관계 id로 연결 삭제. */
export function removeLink(links: RestoredLink[], relationId: string): RestoredLink[] {
  return links.filter((l) => l.relationId !== relationId);
}

/** 모든 연결 비우기(되돌리기). 시그니처 일관성을 위해 인자를 받지만 무시한다. */
export function clearLinks(_links: RestoredLink[]): RestoredLink[] {
  return [];
}

/** 특정 생물을 food나 eater로 포함하는 연결만. 선택 카드 강조에 사용. */
export function linksTouching(links: RestoredLink[], organismId: string): RestoredLink[] {
  return links.filter((l) => l.foodId === organismId || l.eaterId === organismId);
}

/** 학생이 복원한 연결이 정답 관계 집합과 일치하는지. 순서 무관. */
export function gradeRestoration(
  links: RestoredLink[],
  expectedRelationIds: string[],
): { matched: string[]; missing: string[]; extra: string[] } {
  const got = new Set(links.map((l) => l.relationId));
  const expected = new Set(expectedRelationIds);
  const matched = [...expected].filter((id) => got.has(id));
  const missing = [...expected].filter((id) => !got.has(id));
  const extra = [...got].filter((id) => !expected.has(id));
  return { matched, missing, extra };
}

/** eater가 가진 전체 먹이 수(저장된 연결 기준). 대체 먹이 판정에 사용. */
export function foodCountOf(links: RestoredLink[], eaterId: string): number {
  return links.filter((l) => l.eaterId === eaterId).length;
}

/** food의 포식자(이것을 먹는 생물)들. */
export function predatorsOf(links: RestoredLink[], foodId: string): string[] {
  return links.filter((l) => l.foodId === foodId).map((l) => l.eaterId);
}

/** eater가 먹는 먹이들. */
export function preyOf(links: RestoredLink[], eaterId: string): string[] {
  return links.filter((l) => l.eaterId === eaterId).map((l) => l.foodId);
}
