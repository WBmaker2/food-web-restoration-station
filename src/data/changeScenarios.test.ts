import { describe, expect, it } from 'vitest';
import { CHANGE_SCENARIOS } from './changeScenarios';

describe('changeScenarios — 학습 모드 계약', () => {
  it('현재 미션은 6개이고 첫 미션은 화살표 연습으로 시작한다', () => {
    expect(CHANGE_SCENARIOS).toHaveLength(6);
    expect(CHANGE_SCENARIOS[0].learningMode).toBe('arrow');
    expect(CHANGE_SCENARIOS[0].choiceRelationIds).toEqual(CHANGE_SCENARIOS[0].expectedRelations);
  });

  it('영향 미션은 정답 외 선택 후보를 제공한다', () => {
    const impactScenarios = CHANGE_SCENARIOS.filter((scenario) => scenario.learningMode === 'impact');
    expect(impactScenarios).toHaveLength(5);
    expect(impactScenarios.some((scenario) => scenario.choiceRelationIds.length > scenario.expectedRelations.length)).toBe(true);
  });
});
