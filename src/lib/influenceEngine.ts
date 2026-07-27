import type {
  ChangeKind,
  Influence,
  InfluenceResult,
  PopulationLevel,
} from '../data/types';
import type { RestoredLink } from './foodWebGraph';
import { foodCountOf, isDecomposer, predatorsOf, preyOf } from './foodWebGraph';

// 영향 판정 엔진.
// 문서 Section 10.1 의 판정 순서를 그대로 따른다:
//  1) 사건 대상 상태 적용
//  2) 대상을 먹는 생물(포식자) -> 먹이 부족 방향 검토
//  3) 대상이 먹는 생물(먹이) -> 포식 압력 감소 방향 검토
//  4) 대체 먹이가 있으면 decrease-possible/uncertain 로 낮춤
//  5) 두 단계 이상 떨어진 변화는 간접(uncertain) 라벨
//  6) 분해자는 개체수 변화의 원인으로 자동 연결하지 않음

/** 변화 -> 수준 변화. */
function applyChangeToLevel(level: PopulationLevel, change: ChangeKind): PopulationLevel {
  const order: PopulationLevel[] = ['low', 'medium', 'high'];
  const i = order.indexOf(level);
  if (change === 'disappear') return 'low';
  if (change === 'increase') return order[Math.min(2, i + 1)];
  return order[Math.max(0, i - 1)]; // decrease
}

/** 변화의 부호. +1=증가, -1=감소, 0=사라짐(강한 감소). */
function changeSign(change: ChangeKind): number {
  if (change === 'increase') return 1;
  return -1; // decrease, disappear
}

/**
 * 사건 발동 시 먹이망 전체에 미치는 영향을 계산한다.
 * @param links 학생이 복원한 연결
 * @param trigger 사건 ({ organismId, change })
 * @param initial 모든 생물의 사건 전 수준
 * @param allIds 이번 미션에 등장하는 생물 id 목록(분해자 포함 가능)
 */
export function computeInfluences(
  links: RestoredLink[],
  trigger: { organismId: string; change: ChangeKind },
  initial: Record<string, PopulationLevel>,
  allIds: string[],
): InfluenceResult[] {
  const sign = changeSign(trigger.change);
  const reasons: Record<string, string[]> = {};

  /** 생물 -> 사건 대상으로부터의 관계 거리. */
  const distance: Record<string, number> = {};
  /** 직접 영향 방향(증가/감소). 직접만 기록, 간접은 uncertain 로 덮음. */
  const directDir: Record<string, number> = {};

  // 1) 대상 자신
  distance[trigger.organismId] = 0;
  directDir[trigger.organismId] = sign;

  const queue: string[] = [trigger.organismId];

  // BFS: 직접(1단계) 먼저, 그 다음 간접(2단계 이상).
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const curDist = distance[cur];

    // 2) cur 을 먹는 생물(포식자): 먹이가 줄면 같이 준다, 먹이가 늘면 같이 는다.
    for (const pred of predatorsOf(links, cur)) {
      if (isDecomposer(pred)) continue; // 규칙 6
      if (pred === trigger.organismId) continue;
      const proposed = directDir[cur] ?? sign; // 간접은 부호가 불확실하지만 흐름은 전달
      recordNode(pred, curDist + 1, proposed, reasons, distance, directDir);
      if (distance[pred] === curDist + 1) queue.push(pred);
    }

    // 3) cur 이 먹는 생물(먹이): 포식 압력 감소/증가로 반대 방향.
    for (const prey of preyOf(links, cur)) {
      if (isDecomposer(prey)) continue; // 규칙 6
      if (prey === trigger.organismId) continue;
      const proposed = -(directDir[cur] ?? sign); // 포식 압력 반대
      recordNode(prey, curDist + 1, proposed, reasons, distance, directDir);
      if (distance[prey] === curDist + 1) queue.push(prey);
    }
  }

  // 결과 조립
  const results: InfluenceResult[] = [];
  for (const id of allIds) {
    if (isDecomposer(id)) {
      // 분해자는 별도 설명 카드로만. 영향 결과에서 제외하지 않되 no-direct-change.
      results.push({
        organismId: id,
        level: initial[id] ?? 'medium',
        influence: 'no-direct-change',
        reasons: ['분해자는 개체수 변화의 원인으로 자동 연결하지 않아요.'],
        distance: Infinity,
      });
      continue;
    }
    if (!(id in distance)) {
      // 연결되지 않은 생물 -> 직접 변화 아님.
      results.push({
        organismId: id,
        level: initial[id] ?? 'medium',
        influence: 'no-direct-change',
        reasons: ['이 생물은 사건 대상과 직접 연결되어 있지 않아요.'],
        distance: Infinity,
      });
      continue;
    }

    const dist = distance[id];

    // 0) 사건 대상 본인
    if (dist === 0) {
      const newLevel = applyChangeToLevel(initial[id] ?? 'medium', trigger.change);
      results.push({
        organismId: id,
        level: newLevel,
        influence: trigger.change === 'increase' ? 'increase' : 'decrease',
        reasons: ['사건으로 직접 변화한 생물이에요.'],
        distance: 0,
      });
      continue;
    }

    const dir = directDir[id] ?? sign;

    // 4) 대체 먹이: 포식자가 먹이를 2종 이상 가지면 단정적 사라짐을 막는다.
    //    단, decrease 상황에서 먹이가 줄어드는 포식자에만 적용.
    const isPredatorPath = dir < 0 && trigger.change !== 'increase';
    let influence: Influence;
    let reasonList: string[];

    if (dist >= 2) {
      // 규칙 5: 간접 영향은 확정 대신 가능성 표현.
      influence = 'uncertain';
      reasonList = [
        `${dist}단계 떨어진 간접 영향이라 확정하기 어려워요. 중간에 어떤 생물이 연결되어 있는지 한 단계씩 확인해 보세요.`,
      ];
    } else if (isPredatorPath && foodCountOf(links, id) >= 2) {
      // 규칙 4: 대체 먹이가 있으면 줄 수는 있지만 단정할 수 없음.
      influence = 'decrease-possible';
      const alts = preyOf(links, id).filter((p) => p !== trigger.organismId);
      reasonList = [
        `이 생물은 다른 먹이(${alts.join(', ') || '없음'})도 있어서 줄어들 수는 있지만 바로 사라진다고 단정하기 어려워요.`,
      ];
    } else {
      influence = dir > 0 ? 'increase' : 'decrease';
      reasonList =
        dir > 0
          ? ['먹이/포식 관계로 인해 늘어날 수 있어요.']
          : ['먹이/포식 관계로 인해 줄어들 수 있어요.'];
    }

    // 수준은 방향에 따라 한 단계 조정(간접/불확실은 보수적으로).
    const level = adjustLevel(initial[id] ?? 'medium', dir, dist);

    results.push({
      organismId: id,
      level,
      influence,
      reasons: reasonList,
      distance: dist,
    });
  }

  return results;
}

function recordNode(
  id: string,
  dist: number,
  dir: number,
  reasons: Record<string, string[]>,
  distance: Record<string, number>,
  directDir: Record<string, number>,
) {
  if (!(id in distance) || distance[id] > dist) {
    distance[id] = dist;
    directDir[id] = dir;
    reasons[id] = reasons[id] ?? [];
  }
}

function adjustLevel(level: PopulationLevel, dir: number, dist: number): PopulationLevel {
  const order: PopulationLevel[] = ['low', 'medium', 'high'];
  const i = order.indexOf(level);
  // 간접 영향은 수준 변화를 보수적으로(반영 안 함).
  if (dist >= 2) return level;
  const step = dir > 0 ? 1 : -1;
  return order[Math.max(0, Math.min(2, i + step))];
}

/** 영향 한글 라벨. 색 외에 글자로도 표시(접근성). */
export const INFLUENCE_LABEL: Record<Influence, string> = {
  increase: '늘어날 수 있음',
  decrease: '줄어들 수 있음',
  'decrease-possible': '줄 수는 있지만 단정 금지',
  uncertain: '간접 영향(불확실)',
  'no-direct-change': '직접 변화 없음',
};
