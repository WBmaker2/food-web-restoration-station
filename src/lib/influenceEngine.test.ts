import { describe, it, expect } from 'vitest';
import { computeInfluences, INFLUENCE_LABEL } from './influenceEngine';
import { addLink } from './foodWebGraph';
import { FEEDING_RELATIONS } from '../data/feedingRelations';

const R = FEEDING_RELATIONS;

// 헬퍼: addLink 결과에서 link 만 순차적으로 누적 추출
function L(...ids: string[]) {
  const out: { relationId: string; foodId: string; eaterId: string }[] = [];
  for (const id of ids) {
    const r = addLink(out, id, R);
    if (r.ok) out.push(r.link);
  }
  return out;
}

const initial = {
  grass: 'high', grasshopper: 'high', frog: 'medium',
  snake: 'medium', hawk: 'low', beetle: 'medium',
} as Record<string, 'low' | 'medium' | 'high'>;

describe('influenceEngine — 문서 17.2 영향 엔진 단위 검증', () => {
  it('먹이 감소 -> 포식자 감소 가능 방향을 계산한다', () => {
    const g = L('r-grass-grasshopper', 'r-grasshopper-frog');
    const res = computeInfluences(
      g,
      { organismId: 'grasshopper', change: 'decrease' },
      initial,
      ['grass', 'grasshopper', 'frog'],
    );
    const frog = res.find((r) => r.organismId === 'frog')!;
    expect(frog.influence).toBe('decrease');
    expect(frog.distance).toBe(1);
  });

  it('포식자 감소 -> 먹이 증가 가능 방향을 계산한다', () => {
    const g = L('r-grass-grasshopper', 'r-grasshopper-frog');
    const res = computeInfluences(
      g,
      { organismId: 'frog', change: 'decrease' },
      initial,
      ['grass', 'grasshopper', 'frog'],
    );
    const grasshopper = res.find((r) => r.organismId === 'grasshopper')!;
    expect(grasshopper.influence).toBe('increase');
    expect(grasshopper.distance).toBe(1);
  });

  it('대체 먹이가 있으면 decrease-possible 로 처리한다', () => {
    // 개구리가 메뚜기 + 작은 곤충 모두 먹음
    const g = L('r-grass-grasshopper', 'r-grasshopper-frog', 'r-beetle-frog');
    const res = computeInfluences(
      g,
      { organismId: 'grasshopper', change: 'decrease' },
      { ...initial, beetle: 'medium' },
      ['grass', 'grasshopper', 'frog', 'beetle'],
    );
    const frog = res.find((r) => r.organismId === 'frog')!;
    expect(frog.influence).toBe('decrease-possible');
  });

  it('두 단계 이상 영향에 간접(uncertain) 라벨이 붙는다', () => {
    // 풀 -> 메뚜기 -> 개구리 -> 뱀: 풀 감소 시 뱀은 distance 3
    const g = L('r-grass-grasshopper', 'r-grasshopper-frog', 'r-frog-snake');
    const res = computeInfluences(
      g,
      { organismId: 'grass', change: 'decrease' },
      { ...initial, snake: 'medium' },
      ['grass', 'grasshopper', 'frog', 'snake'],
    );
    const snake = res.find((r) => r.organismId === 'snake')!;
    expect(snake.distance).toBeGreaterThanOrEqual(2);
    expect(snake.influence).toBe('uncertain');
  });

  it('연결되지 않은 생물은 no-direct-change 로 표시된다', () => {
    const g = L('r-grass-grasshopper', 'r-grasshopper-frog');
    const res = computeInfluences(
      g,
      { organismId: 'grass', change: 'decrease' },
      { ...initial, snake: 'medium' },
      ['grass', 'grasshopper', 'frog', 'snake'], // snake 는 이 그래프에 연결 안 됨
    );
    const snake = res.find((r) => r.organismId === 'snake')!;
    expect(snake.influence).toBe('no-direct-change');
    expect(snake.distance).toBe(Infinity);
  });

  it('분해자는 개체수 변화의 원인으로 자동 연결하지 않는다', () => {
    const g = L('r-grass-grasshopper', 'r-grasshopper-frog');
    const res = computeInfluences(
      g,
      { organismId: 'grass', change: 'decrease' },
      { ...initial, mushroom: 'medium' },
      ['grass', 'grasshopper', 'frog', 'mushroom'],
    );
    const mushroom = res.find((r) => r.organismId === 'mushroom')!;
    expect(mushroom.influence).toBe('no-direct-change');
  });

  it('사건 대상 본인은 distance 0 으로 표시된다', () => {
    const g = L('r-grass-grasshopper');
    const res = computeInfluences(
      g,
      { organismId: 'grass', change: 'decrease' },
      initial,
      ['grass', 'grasshopper'],
    );
    const grass = res.find((r) => r.organismId === 'grass')!;
    expect(grass.distance).toBe(0);
    expect(grass.influence).toBe('decrease');
  });

  it('사라짐 사건은 수준을 low 로 만든다', () => {
    const g = L('r-grass-grasshopper', 'r-grasshopper-frog', 'r-frog-snake', 'r-snake-hawk');
    const res = computeInfluences(
      g,
      { organismId: 'snake', change: 'disappear' },
      { ...initial, snake: 'medium', hawk: 'low' },
      ['grass', 'grasshopper', 'frog', 'snake', 'hawk'],
    );
    const snake = res.find((r) => r.organismId === 'snake')!;
    expect(snake.level).toBe('low');
    // 매는 뱀의 포식자 -> 먹이 부족
    const hawk = res.find((r) => r.organismId === 'hawk')!;
    expect(hawk.influence).toBe('decrease');
  });

  it('INFLUENCE_LABEL 이 모든 영향 종류의 한글 라벨을 가진다', () => {
    expect(INFLUENCE_LABEL.increase).toBeTruthy();
    expect(INFLUENCE_LABEL.decrease).toBeTruthy();
    expect(INFLUENCE_LABEL['decrease-possible']).toBeTruthy();
    expect(INFLUENCE_LABEL.uncertain).toBeTruthy();
    expect(INFLUENCE_LABEL['no-direct-change']).toBeTruthy();
  });
});
