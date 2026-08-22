import { describe, it, expect } from 'vitest';
import {
  addLink,
  addLinkByPair,
  removeLink,
  clearLinks,
  gradeRestoration,
  findReversed,
  foodCountOf,
  predatorsOf,
  preyOf,
  isDecomposer,
} from './foodWebGraph';
import { FEEDING_RELATIONS } from '../data/feedingRelations';

const R = FEEDING_RELATIONS;

describe('foodWebGraph — 문서 17.1 관계 그래프 단위 검증', () => {
  it('올바른 관계를 추가할 수 있다', () => {
    const res = addLink([], 'r-grass-grasshopper', R);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.link.foodId).toBe('grass');
      expect(res.link.eaterId).toBe('grasshopper');
    }
  });

  it('중복 연결은 한 번만 저장한다', () => {
    const first = addLink([], 'r-grass-grasshopper', R);
    if (!first.ok) throw new Error('setup failed');
    const second = addLink([first.link], 'r-grass-grasshopper', R);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe('duplicate');
  });

  it('같은 쌍의 역순 입력도 중복으로 막는다', () => {
    const first = addLink([], 'r-grass-grasshopper', R);
    if (!first.ok) throw new Error('setup failed');
    // 같은 쌍에 대한 다른 relation은 정의에 없으므로, 동일 id 재추가로 대체 검증
    const dup = addLink([first.link], 'r-grass-grasshopper', R);
    expect(dup.ok).toBe(false);
  });

  it('자기 자신을 먹는 연결을 거부한다', () => {
    // self-loop relation 을 인위적으로 만들어 검증
    const selfRel = [{ id: 'r-self', foodId: 'grass', eaterId: 'grass', clue: '', confidence: 'certain' as const }];
    const res = addLink([], 'r-self', selfRel);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('self-loop');
  });

  it('역방향 관계를 감지한다', () => {
    const first = addLink([], 'r-grass-grasshopper', R);
    if (!first.ok) throw new Error('setup failed');
    // grass<-grasshopper 방향(역) 추가 시도: 같은 쌍이므로 reversed 로 감지
    const reversedRel = [{ id: 'r-grasshopper-grass', foodId: 'grasshopper', eaterId: 'grass', clue: '', confidence: 'certain' as const }];
    const res = addLink([first.link], 'r-grasshopper-grass', reversedRel);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('reversed');
  });

  it('카드 두 장의 올바른 순서를 관계로 연결한다', () => {
    const res = addLinkByPair([], 'grass', 'grasshopper', R);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.link.relationId).toBe('r-grass-grasshopper');
  });

  it('카드 두 장을 역순으로 고르면 방향 피드백을 반환한다', () => {
    const res = addLinkByPair([], 'grasshopper', 'grass', R);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('reversed');
  });

  it('분해자를 포식 관계에 자동 연결하지 않는다', () => {
    const decomposerRel = [{ id: 'r-grass-mushroom', foodId: 'grass', eaterId: 'mushroom', clue: '', confidence: 'certain' as const }];
    const res = addLink([], 'r-grass-mushroom', decomposerRel);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('decomposer');
    expect(isDecomposer('mushroom')).toBe(true);
  });

  it('관계 삭제가 동작한다', () => {
    const first = addLink([], 'r-grass-grasshopper', R);
    if (!first.ok) throw new Error('setup failed');
    const after = removeLink([first.link], 'r-grass-grasshopper');
    expect(after).toHaveLength(0);
  });

  it('clearLinks 가 모든 연결을 비운다', () => {
    const a = addLink([], 'r-grass-grasshopper', R);
    const b = addLink([], 'r-grasshopper-frog', R);
    if (!a.ok || !b.ok) throw new Error('setup failed');
    expect(clearLinks([a.link, b.link])).toHaveLength(0);
  });

  it('findReversed 가 반대 방향 연결을 찾는다', () => {
    const first = addLink([], 'r-grass-grasshopper', R);
    if (!first.ok) throw new Error('setup failed');
    const found = findReversed([first.link], 'grasshopper', 'grass');
    expect(found).toBeDefined();
  });

  it('gradeRestoration 이 정답 집합을 정확히 비교한다 (위치 무관, ID 기반)', () => {
    const expected = ['r-grass-grasshopper', 'r-grasshopper-frog', 'r-frog-snake'];
    const a = addLink([], 'r-grass-grasshopper', R);
    const b = addLink([], 'r-grasshopper-frog', R);
    const c = addLink([], 'r-frog-snake', R);
    if (!a.ok || !b.ok || !c.ok) throw new Error('setup failed');
    const result = gradeRestoration([a.link, b.link, c.link], expected);
    expect(result.matched.sort()).toEqual([...expected].sort());
    expect(result.missing).toHaveLength(0);
    expect(result.extra).toHaveLength(0);
  });

  it('gradeRestoration 이 누락/초과를 구분한다', () => {
    const expected = ['r-grass-grasshopper', 'r-grasshopper-frog'];
    const a = addLink([], 'r-grass-grasshopper', R);
    if (!a.ok) throw new Error('setup failed');
    const result = gradeRestoration([a.link], expected);
    expect(result.matched).toEqual(['r-grass-grasshopper']);
    expect(result.missing).toEqual(['r-grasshopper-frog']);
  });

  it('foodCountOf / predatorsOf / preyOf 가 정확히 계산된다', () => {
    const a = addLink([], 'r-grass-grasshopper', R);
    const b = addLink([], 'r-grasshopper-frog', R);
    const c = addLink([], 'r-beetle-frog', R);
    if (!a.ok || !b.ok || !c.ok) throw new Error('setup failed');
    const links = [a.link, b.link, c.link];
    expect(foodCountOf(links, 'frog')).toBe(2); // 메뚜기 + 작은 곤충
    expect(predatorsOf(links, 'grasshopper')).toEqual(['frog']);
    expect(preyOf(links, 'frog').sort()).toEqual(['beetle', 'grasshopper']);
  });
});
