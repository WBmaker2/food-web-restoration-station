import type { RestoredLink } from './foodWebGraph';
import { getOrganism } from '../data/foodWebOrganisms';

// 화면 낭독기용 접근성 라벨.
// 문서 Section 13: 연결 정보를 "풀에서 메뚜기로 먹이 관계"처럼 읽을 수 있도록.

/** 연결 하나의 aria-label. */
export function linkAriaLabel(link: RestoredLink): string {
  const food = getOrganism(link.foodId)?.name ?? link.foodId;
  const eater = getOrganism(link.eaterId)?.name ?? link.eaterId;
  return `${food}에서 ${eater}(으)로 먹이 관계. ${food}이(가) 먹히고 ${eater}이(가) 먹습니다.`;
}

/** 카드 한 장의 aria-label (역할·설명 포함). */
export function cardAriaLabel(organismId: string): string {
  const o = getOrganism(organismId);
  if (!o) return organismId;
  const roleMap: Record<string, string> = {
    producer: '생산자',
    primaryConsumer: '1차 소비자',
    secondaryConsumer: '2차 소비자',
    apexConsumer: '상위 소비자',
    decomposer: '분해자',
  };
  return `${o.name}, ${roleMap[o.role]}. ${o.shortDescription}`;
}

/** 영향 결과 한 건의 aria-label. */
export function influenceAriaLabel(organismId: string, label: string, distance: number): string {
  const name = getOrganism(organismId)?.name ?? organismId;
  const distText =
    distance === 0 ? '사건 대상' : distance === 1 ? '직접 연결' : distance >= 2 ? '간접 연결' : '연결 없음';
  return `${name}: ${distText}, ${label}.`;
}
