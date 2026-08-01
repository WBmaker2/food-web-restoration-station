import { describe, it, expect } from 'vitest';
import { renderReasoningSentence } from './feedbackRules';

// 근거 문장 렌더링이 받침에 맞춘 올바른 조사를 만드는지 검증.
describe('renderReasoningSentence — 조사 결합 렌더링', () => {
  it('tpl-food-shortage: 먹이 감소 문장', () => {
    const s = renderReasoningSentence('tpl-food-shortage', { food: '풀', eater: '개구리', dir: '줄어들' });
    // 풀(받침)이 / 개구리(받침 없)는 / 줄어들 수 있습니다
    expect(s).toBe('풀이 줄어들면 개구리는 먹이가 줄어 줄어들 수 있습니다.');
  });

  it('tpl-predation-release: 포식 압력 감소 문장', () => {
    const s = renderReasoningSentence('tpl-predation-release', {
      predator: '뱀', prey: '개구리', food: '메뚜기', dir: '늘어날',
    });
    // 뱀(받침)이 / 개구리(받침 없)가 / 메뚜기(받침 없)는 / 늘어날 수 있습니다
    expect(s).toBe('뱀이 줄어들면 개구리가 먹던 메뚜기는 포식 압력이 줄어 늘어날 수 있습니다.');
  });

  it('tpl-evidence: 근거 연결 문장 (와/과)', () => {
    const s = renderReasoningSentence('tpl-evidence', { a: '풀', b: '메뚜기' });
    // 풀(받침)과
    expect(s).toBe('이 예측의 근거는 풀과 메뚜기의 연결입니다.');
  });

  it('값이 비면 자리표시자 ___ 사용', () => {
    const s = renderReasoningSentence('tpl-food-shortage', {});
    expect(s).toBe('___ 줄어들면 ___ 먹이가 줄어 ___ 수 있습니다.');
  });

  it('알 수 없는 템플릿 id 는 빈 문자열', () => {
    expect(renderReasoningSentence('nope', {})).toBe('');
  });
});
