import { describe, it, expect } from 'vitest';
import { renderReasoningSentence, getReasoningTemplates } from './feedbackRules';

// 근거 문장 렌더링이 받침에 맞춘 올바른 조사를 만드는지 검증.
describe('renderReasoningSentence — 조사 결합 렌더링', () => {
  it('tpl-food-shortage (decrease): 먹이 감소 문장', () => {
    const s = renderReasoningSentence('tpl-food-shortage', { food: '풀', eater: '개구리', dir: '줄어들' }, 'decrease');
    expect(s).toBe('풀이 줄어들면 개구리는 먹이가 줄어 줄어들 수 있습니다.');
  });

  it('tpl-predation-release (decrease): 포식 압력 감소 문장', () => {
    const s = renderReasoningSentence('tpl-predation-release', {
      predator: '뱀', prey: '개구리', food: '메뚜기', dir: '늘어날',
    }, 'decrease');
    expect(s).toBe('뱀이 줄어들면 개구리가 먹던 메뚜기는 포식 압력이 줄어 늘어날 수 있습니다.');
  });

  it('tpl-evidence: 근거 연결 문장 (와/과)', () => {
    const s = renderReasoningSentence('tpl-evidence', { a: '풀', b: '메뚜기' }, 'decrease');
    expect(s).toBe('이 예측의 근거는 풀과 메뚜기의 연결입니다.');
  });

  it('값이 비면 자리표시자 ___ 사용', () => {
    const s = renderReasoningSentence('tpl-food-shortage', {}, 'decrease');
    expect(s).toBe('___ 줄어들면 ___ 먹이가 줄어 ___ 수 있습니다.');
  });

  it('알 수 없는 템플릿 id 는 빈 문자열', () => {
    expect(renderReasoningSentence('nope', {}, 'decrease')).toBe('');
  });
});

// 사건 종류(change)에 따라 템플릿 앞부분이 맥락에 맞게 바뀌는지 검증.
describe('renderReasoningSentence — 사건 맥락별 템플릿', () => {
  it('increase 사건: "늘어나면"으로 시작 (감소가 아님)', () => {
    const s = renderReasoningSentence('tpl-food-shortage', { food: '풀', eater: '메뚜기', dir: '늘어날' }, 'increase');
    // 풀이 늘어나면 메뚜기는 먹이가 늘어나 늘어날 수 있습니다.
    expect(s).toBe('풀이 늘어나면 메뚜기는 먹이가 늘어나 늘어날 수 있습니다.');
    expect(s).not.toContain('줄어들면'); // 감소 맥락이 섞이지 않아야 함
  });

  it('decrease 사건: "줄어들면"으로 시작', () => {
    const s = renderReasoningSentence('tpl-food-shortage', { food: '메뚜기', eater: '개구리', dir: '줄어들' }, 'decrease');
    expect(s).toBe('메뚜기가 줄어들면 개구리는 먹이가 줄어 줄어들 수 있습니다.');
  });

  it('disappear 사건: "사라지면"으로 시작', () => {
    const s = renderReasoningSentence('tpl-food-shortage', { food: '뱀', eater: '매', dir: '줄어들' }, 'disappear');
    expect(s).toBe('뱀이 사라지면 매는 먹이가 줄어 줄어들 수 있습니다.');
  });

  it('increase 사건의 predation-release: 포식 압력이 늘어난다', () => {
    const s = renderReasoningSentence('tpl-predation-release', {
      predator: '뱀', prey: '개구리', food: '메뚜기', dir: '줄어들',
    }, 'increase');
    expect(s).toContain('늘어나면');
    expect(s).toContain('포식 압력이 늘어나');
  });
});

describe('getReasoningTemplates — 변화 종류별 템플릿', () => {
  it('각 변화 종류마다 4개 템플릿을 반환', () => {
    expect(getReasoningTemplates('increase')).toHaveLength(4);
    expect(getReasoningTemplates('decrease')).toHaveLength(4);
    expect(getReasoningTemplates('disappear')).toHaveLength(4);
  });

  it('increase 템플릿의 food-shortage는 "늘어나면" 포함', () => {
    const t = getReasoningTemplates('increase').find((x) => x.id === 'tpl-food-shortage')!;
    expect(t.template).toContain('늘어나면');
    expect(t.template).not.toContain('줄어들면');
  });

  it('disappear 템플릿의 food-shortage는 "사라지면" 포함', () => {
    const t = getReasoningTemplates('disappear').find((x) => x.id === 'tpl-food-shortage')!;
    expect(t.template).toContain('사라지면');
  });
});
