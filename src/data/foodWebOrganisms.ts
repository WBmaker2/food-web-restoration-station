import type { OrganismCard } from './types';

// 가상 초원의 생물 카드.
// 실제 종의 모든 먹이를 대표한다고 주장하지 않고,
// '이 앱의 가상 초원 규칙'으로 표시함 (문서 Section 7.1, 5.3).

export const FOOD_WEB_ORGANISMS: OrganismCard[] = [
  // ── 생산자 ──
  {
    id: 'grass',
    name: '풀',
    role: 'producer',
    icon: '🌿',
    shortDescription: '햇빛으로 스스로 양분을 만드는 생산자예요.',
    habitat: 'grassland',
  },
  {
    id: 'flower',
    name: '들꽃',
    role: 'producer',
    icon: '🌼',
    shortDescription: '햇빛으로 양분을 만드는 생산자예요. 곤충을 끌어들여요.',
    habitat: 'grassland',
  },
  // ── 1차 소비자 ──
  {
    id: 'grasshopper',
    name: '메뚜기',
    role: 'primaryConsumer',
    icon: '🦗',
    shortDescription: '풀을 갉아먹는 초식 곤충이에요.',
    habitat: 'grassland',
  },
  {
    id: 'rabbit',
    name: '토끼',
    role: 'primaryConsumer',
    icon: '🐰',
    shortDescription: '풀과 어린 식물을 먹는 초식동물이에요.',
    habitat: 'grassland',
  },
  {
    id: 'vole',
    name: '들쥐',
    role: 'primaryConsumer',
    icon: '🐭',
    shortDescription: '씨앗과 풀을 먹는 작은 초식동물이에요.',
    habitat: 'grassland',
  },
  {
    id: 'beetle',
    name: '작은 곤충',
    role: 'primaryConsumer',
    icon: '🐞',
    shortDescription: '풀이나 꽃을 갉아먹는 작은 곤충이에요.',
    habitat: 'grassland',
  },
  // ── 2차 소비자 ──
  {
    id: 'frog',
    name: '개구리',
    role: 'secondaryConsumer',
    icon: '🐸',
    shortDescription: '메뚜기와 작은 곤충을 잡아먹어요.',
    habitat: 'grassland',
  },
  {
    id: 'snake',
    name: '뱀',
    role: 'secondaryConsumer',
    icon: '🐍',
    shortDescription: '개구리와 들쥐를 잡아먹어요.',
    habitat: 'grassland',
  },
  {
    id: 'weasel',
    name: '족제비',
    role: 'secondaryConsumer',
    icon: '🦡',
    shortDescription: '들쥐와 토끼 새끼를 잡아먹어요.',
    habitat: 'grassland',
  },
  // ── 상위 소비자 ──
  {
    id: 'hawk',
    name: '매',
    role: 'apexConsumer',
    icon: '🦅',
    shortDescription: '뱀과 작은 동물을 잡아먹는 상위 포식자예요.',
    habitat: 'grassland',
  },
  {
    id: 'fox',
    name: '여우',
    role: 'apexConsumer',
    icon: '🦊',
    shortDescription: '토끼와 들쥐를 잡아먹는 상위 포식자예요.',
    habitat: 'grassland',
  },
  // ── 분해자 (포식 관계에서 제외) ──
  {
    id: 'mushroom',
    name: '버섯',
    role: 'decomposer',
    icon: '🍄',
    shortDescription: '죽은 생물과 유기물을 분해해 물질 순환을 돕는 분해자예요.',
    habitat: 'grassland',
  },
];

/** id -> 카드 조회. */
export const ORGANISM_BY_ID: Record<string, OrganismCard> = Object.fromEntries(
  FOOD_WEB_ORGANISMS.map((o) => [o.id, o]),
);

export function getOrganism(id: string): OrganismCard | undefined {
  return ORGANISM_BY_ID[id];
}

/** 역할 한글 라벨. 색과 함께 글자로도 역할을 표시 (접근성). */
export const ROLE_LABEL: Record<OrganismCard['role'], string> = {
  producer: '생산자',
  primaryConsumer: '1차 소비자',
  secondaryConsumer: '2차 소비자',
  apexConsumer: '상위 소비자',
  decomposer: '분해자',
};

/** 역할별 색상 토큰(CSS 변수명). 색만으로 구분하지 않으므로 아이콘·글자와 병용. */
export const ROLE_COLOR_VAR: Record<OrganismCard['role'], string> = {
  producer: '--role-producer',
  primaryConsumer: '--role-primary',
  secondaryConsumer: '--role-secondary',
  apexConsumer: '--role-apex',
  decomposer: '--role-decomposer',
};
