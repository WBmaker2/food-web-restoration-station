import { describe, it, expect } from 'vitest';
import { hasBatchim, iGa, eunNeun, eulReul, waGwa, euroRo } from './koreanPostpositions';

// 한국어 조사 헬퍼 검증. 어색한 "이(가)" 병기를 없애기 위한 핵심 로직.
describe('koreanPostpositions — 받침-aware 조사', () => {
  describe('hasBatchim', () => {
    it('받침 있는 한글을 true 로 판별', () => {
      expect(hasBatchim('풀')).toBe(true);
      expect(hasBatchim('뱀')).toBe(true);
      expect(hasBatchim('버섯')).toBe(true);
      expect(hasBatchim('들꽃')).toBe(true);
      expect(hasBatchim('작은 곤충')).toBe(true); // 마지막 글자 기준
    });
    it('받침 없는 한글을 false 로 판별', () => {
      expect(hasBatchim('메뚜기')).toBe(false);
      expect(hasBatchim('토끼')).toBe(false);
      expect(hasBatchim('개구리')).toBe(false);
      expect(hasBatchim('매')).toBe(false);
      expect(hasBatchim('여우')).toBe(false);
    });
    it('빈 문자열/한글 아님을 false 로', () => {
      expect(hasBatchim('')).toBe(false);
      expect(hasBatchim('abc')).toBe(false);
      expect(hasBatchim('fox')).toBe(false);
    });
  });

  describe('iGa (이/가)', () => {
    it('받침 있으면 -이', () => {
      expect(iGa('풀')).toBe('풀이');
      expect(iGa('뱀')).toBe('뱀이');
    });
    it('받침 없으면 -가', () => {
      expect(iGa('메뚜기')).toBe('메뚜기가');
      expect(iGa('매')).toBe('매가');
    });
  });

  describe('eunNeun (은/는)', () => {
    it('받침 있으면 -은', () => expect(eunNeun('풀')).toBe('풀은'));
    it('받침 없으면 -는', () => expect(eunNeun('메뚜기')).toBe('메뚜기는'));
  });

  describe('eulReul (을/를)', () => {
    it('받침 있으면 -을', () => expect(eulReul('풀')).toBe('풀을'));
    it('받침 없으면 -를', () => expect(eulReul('매')).toBe('매를'));
  });

  describe('waGwa (와/과)', () => {
    it('받침 있으면 -과', () => expect(waGwa('풀')).toBe('풀과'));
    it('받침 없으면 -와', () => expect(waGwa('매')).toBe('매와'));
  });

  describe('euroRo ((으)로)', () => {
    it('받침 있으면 -으로', () => {
      expect(euroRo('뱀')).toBe('뱀으로');
      expect(euroRo('버섯')).toBe('버섯으로');
    });
    it('받침 없으면 -로', () => {
      expect(euroRo('매')).toBe('매로');
      expect(euroRo('개구리')).toBe('개구리로');
    });
    it('ㄹ 받침은 예외적으로 -로', () => {
      expect(euroRo('풀')).toBe('풀로'); // ㄹ 종성
    });
  });
});
