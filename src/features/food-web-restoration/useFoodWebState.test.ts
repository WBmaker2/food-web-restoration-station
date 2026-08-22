import { describe, expect, it } from 'vitest';
import { FEEDING_RELATIONS } from '../../data/feedingRelations';
import { relationToRestoredLink } from './useFoodWebState';

describe('useFoodWebState — 기준 관계 변환', () => {
  it('시나리오 관계 id를 영향 계산용 링크로 변환한다', () => {
    expect(relationToRestoredLink('r-beetle-frog')).toEqual({
      relationId: 'r-beetle-frog',
      foodId: 'beetle',
      eaterId: 'frog',
    });
  });

  it('알 수 없는 관계 id는 링크로 만들지 않는다', () => {
    expect(relationToRestoredLink('missing')).toBeUndefined();
    expect(FEEDING_RELATIONS.some((r) => r.id === 'missing')).toBe(false);
  });
});
