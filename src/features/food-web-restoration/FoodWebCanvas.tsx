import { useMemo } from 'react';
import { getOrganism } from '../../data/foodWebOrganisms';
import type { RestoredLink } from '../../lib/foodWebGraph';
import type { InfluenceResult } from '../../data/types';
import { OrganismCard } from './OrganismCard';
import { linkAriaLabel } from '../../lib/accessibilityLabels';

type Props = {
  organismIds: string[];
  links: RestoredLink[];
  influences?: InfluenceResult[];
  selectedId?: string | null;
  /** 단계형 연결 모드: 먹힘 선택 대기 중. */
  stepFoodId?: string | null;
  onSelectOrganism?: (id: string) => void;
  onRemoveLink?: (relationId: string) => void;
};

// 카드 격자 위치. 한 화면 8장 이하(문서 13). 역할별 행으로 배치해 읽기 쉽게.
// 위치는 장식이고 정답 판정은 ID 기반이라(문서 12.2) 고정 레이아웃을 쓴다.
function layoutOrganisms(ids: string[]): Record<string, { x: number; y: number }> {
  const out: Record<string, { x: number; y: number }> = {};
  const roleRow: Record<string, number> = {
    producer: 0,
    primaryConsumer: 1,
    secondaryConsumer: 2,
    apexConsumer: 3,
    decomposer: 4,
  };
  const perRow: Record<number, number> = {};
  for (const id of ids) {
    const o = getOrganism(id);
    const row = o ? roleRow[o.role] : 3;
    const col = perRow[row] ?? 0;
    perRow[row] = col + 1;
    out[id] = { x: 40 + col * 150, y: 50 + row * 130 };
  }
  return out;
}

export function FoodWebCanvas({
  organismIds,
  links,
  influences,
  selectedId,
  stepFoodId,
  onSelectOrganism,
  onRemoveLink,
}: Props) {
  const positions = useMemo(() => layoutOrganisms(organismIds), [organismIds]);

  // 영향 결과를 생물 id -> 거리로. 직접/간접 선 스타일에 사용.
  const distById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const inf of influences ?? []) m[inf.organismId] = inf.distance;
    return m;
  }, [influences]);

  return (
    <div className="fweb-canvas" role="group" aria-label="먹이망 복원 화면">
      {/* SVG 레이어: 화살표만. 카드는 HTML 위에 절대배치. */}
      <svg className="fweb-svg" aria-hidden="true">
        <defs>
          {/* 화살표 머리. 직접/간접 두 종류. */}
          <marker id="arrow-direct" markerWidth="12" markerHeight="12" refX="9" refY="4" orient="auto">
            <path d="M0,0 L9,4 L0,8 z" className="fweb-arrowhead fweb-arrowhead--direct" />
          </marker>
          <marker id="arrow-indirect" markerWidth="12" markerHeight="12" refX="9" refY="4" orient="auto">
            <path d="M0,0 L9,4 L0,8 z" className="fweb-arrowhead fweb-arrowhead--indirect" />
          </marker>
        </defs>
        {links.map((l) => {
          const from = positions[l.foodId];
          const to = positions[l.eaterId];
          if (!from || !to) return null;
          const isIndirect =
            (distById[l.foodId] ?? 0) >= 2 || (distById[l.eaterId] ?? 0) >= 2;
          const touchesSelected =
            selectedId && (l.foodId === selectedId || l.eaterId === selectedId);
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <g key={l.relationId} className={`fweb-edge ${isIndirect ? 'is-indirect' : 'is-direct'} ${touchesSelected ? 'is-emphasized' : ''}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                markerEnd={isIndirect ? 'url(#arrow-indirect)' : 'url(#arrow-direct)'}
              />
              <text x={midX} y={midY - 6} className="fweb-edge-label" textAnchor="middle">
                {getOrganism(l.foodId)?.name} → {getOrganism(l.eaterId)?.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 카드 레이어 */}
      {organismIds.map((id) => {
        const pos = positions[id];
        if (!pos) return null;
        const inf = influences?.find((i) => i.organismId === id);
        return (
          <div
            key={id}
            className="fweb-card-slot"
            style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
          >
            <OrganismCard
              organism={getOrganism(id)!}
              selected={selectedId === id || stepFoodId === id}
              highlighted={Boolean(selectedId && (selectedId === id))}
              dimmed={Boolean(selectedId && selectedId !== id)}
              level={inf ? `거리 ${Number.isFinite(inf.distance) ? inf.distance : '∞'}` : undefined}
              onSelect={onSelectOrganism}
              stateHint={stepFoodId === id ? '먹히는 생물로 선택됨' : undefined}
            />
          </div>
        );
      })}

      {/* 연결 목록(접근성 + 작은 화면 대체). 화면 낭독기가 읽을 수 있도록. */}
      <ul className="fweb-link-list" aria-label="연결한 먹이 관계 목록">
        {links.map((l) => (
          <li key={l.relationId}>
            <span aria-label={linkAriaLabel(l)}>
              {getOrganism(l.foodId)?.name} → {getOrganism(l.eaterId)?.name}
            </span>
            {onRemoveLink && (
              <button
                type="button"
                className="fweb-remove-btn"
                onClick={() => onRemoveLink(l.relationId)}
                aria-label={`${getOrganism(l.foodId)?.name}에서 ${getOrganism(l.eaterId)?.name}(으)로의 연결 지우기`}
              >
                지우기
              </button>
            )}
          </li>
        ))}
        {links.length === 0 && <li className="fweb-empty">아직 연결한 먹이 관계가 없어요.</li>}
      </ul>
    </div>
  );
}
