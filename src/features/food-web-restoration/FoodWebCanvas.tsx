import { useMemo } from 'react';
import { getOrganism } from '../../data/foodWebOrganisms';
import type { RestoredLink } from '../../lib/foodWebGraph';
import type { InfluenceResult, OrganismRole } from '../../data/types';
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

/** 트로픽 레벨(영양 단계): 왼쪽에서 오른쪽으로 갈수록 상위 포식자. */
const TROPHIC_LEVEL: Record<OrganismRole, number> = {
  producer: 0,
  primaryConsumer: 1,
  secondaryConsumer: 2,
  apexConsumer: 3,
  decomposer: 2, // 분해자는 별도지만 공간상 2단계에 배치
};

type Layout = {
  positions: Record<string, { x: number; y: number }>;
  width: number;
  height: number;
};

/**
 * 위상 정렬 기반 카드 배치.
 * 생산자 → 1차 → 2차 → 상위 소비자 순으로 왼쪽에서 오른쪽 열(column)로 배치.
 * 같은 영양 단계 내 생물은 위에서 아래로 행(row)로 정렬.
 * 캔버스 크기는 영양 단계 수와 최대 행 수에 맞춰 동적 계산 → 반응형 대응.
 */
function layoutOrganisms(ids: string[]): Layout {
  if (ids.length === 0) return { positions: {}, width: 600, height: 360 };

  // 영양 단계별로 그룹화
  const byLevel: Record<number, string[]> = {};
  for (const id of ids) {
    const o = getOrganism(id);
    const lvl = o ? TROPHIC_LEVEL[o.role] : 2;
    (byLevel[lvl] ??= []).push(id);
  }

  const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
  const maxRows = Math.max(...levels.map((l) => byLevel[l].length));

  // 캔버스 치수 — 카드 수에 비례해 동적 조정
  const CARD_W = 130;
  const CARD_H = 120;
  const COL_GAP = 60;
  const ROW_GAP = 50;
  const PAD_X = 70;
  const PAD_Y = 80;

  const positions: Record<string, { x: number; y: number }> = {};
  const totalCols = levels.length;

  levels.forEach((lvl, colIdx) => {
    const items = byLevel[lvl];
    const rowsInCol = items.length;
    // 같은 열 안에서 위아래 균등 배치 (중앙 정렬)
    const totalRows = maxRows;
    items.forEach((id, rowIdx) => {
      // 열 내 중앙 정렬: 열의 행들을 전체 행 영역 중앙에 모음
      const offset = (totalRows - rowsInCol) / 2;
      const x = PAD_X + colIdx * (CARD_W + COL_GAP) + CARD_W / 2;
      const y = PAD_Y + (rowIdx + offset) * (CARD_H + ROW_GAP) + CARD_H / 2;
      positions[id] = { x, y };
    });
  });

  const width = Math.max(600, PAD_X * 2 + totalCols * CARD_W + (totalCols - 1) * COL_GAP);
  const height = Math.max(360, PAD_Y * 2 + maxRows * CARD_H + (maxRows - 1) * ROW_GAP);

  return { positions, width, height };
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
  const layout = useMemo(() => layoutOrganisms(organismIds), [organismIds]);

  // 영향 결과를 생물 id -> 거리로. 직접/간접 선 스타일에 사용.
  const distById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const inf of influences ?? []) m[inf.organismId] = inf.distance;
    return m;
  }, [influences]);

  return (
    <div className="fweb-canvas" role="group" aria-label="먹이망 복원 화면">
      {/* 영양 단계 헤더 — 위상 정렬 흐름을 시각적으로 안내 */}
      <div className="fweb-trophic-header" aria-hidden="true">
        <span>생산자</span>
        <span className="fweb-trophic-arrow">→</span>
        <span>1차 소비자</span>
        <span className="fweb-trophic-arrow">→</span>
        <span>2차 소비자</span>
        <span className="fweb-trophic-arrow">→</span>
        <span>상위 소비자</span>
      </div>

      {/* 스크롤 가능한 캔버스: 카드 절대배치 + SVG 화살표 */}
      <div className="fweb-canvas-scroll" style={{ height: layout.height }}>
        <svg
          className="fweb-svg"
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          aria-hidden="true"
        >
          <defs>
            <marker id="arrow-direct" markerWidth="12" markerHeight="12" refX="10" refY="4" orient="auto">
              <path d="M0,0 L10,4 L0,8 z" className="fweb-arrowhead fweb-arrowhead--direct" />
            </marker>
            <marker id="arrow-indirect" markerWidth="12" markerHeight="12" refX="10" refY="4" orient="auto">
              <path d="M0,0 L10,4 L0,8 z" className="fweb-arrowhead fweb-arrowhead--indirect" />
            </marker>
          </defs>
          {links.map((l) => {
            const from = layout.positions[l.foodId];
            const to = layout.positions[l.eaterId];
            if (!from || !to) return null;
            const isIndirect = (distById[l.foodId] ?? 0) >= 2 || (distById[l.eaterId] ?? 0) >= 2;
            const touchesSelected = selectedId && (l.foodId === selectedId || l.eaterId === selectedId);
            // 선 끝점을 카드 테두리에서 약간 떨어뜨려 화살표가 카드에 가려지지 않게
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const trim = 65; // 카드 반지름 정도
            const x1 = from.x + (dx / len) * trim;
            const y1 = from.y + (dy / len) * trim;
            const x2 = to.x - (dx / len) * trim;
            const y2 = to.y - (dy / len) * trim;
            return (
              <g
                key={l.relationId}
                className={`fweb-edge ${isIndirect ? 'is-indirect' : 'is-direct'} ${touchesSelected ? 'is-emphasized' : ''}`}
              >
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  markerEnd={isIndirect ? 'url(#arrow-indirect)' : 'url(#arrow-direct)'}
                />
              </g>
            );
          })}
        </svg>

        {/* 카드 레이어 */}
        {organismIds.map((id) => {
          const pos = layout.positions[id];
          if (!pos) return null;
          const inf = influences?.find((i) => i.organismId === id);
          const o = getOrganism(id);
          const isDecomposer = o?.role === 'decomposer';
          return (
            <div
              key={id}
              className={`fweb-card-slot ${isDecomposer ? 'is-decomposer' : ''}`}
              style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
            >
              <OrganismCard
                organism={o!}
                selected={selectedId === id || stepFoodId === id}
                highlighted={Boolean(selectedId && selectedId === id)}
                dimmed={Boolean(selectedId && selectedId !== id)}
                level={inf ? `거리 ${Number.isFinite(inf.distance) ? inf.distance : '∞'}` : undefined}
                onSelect={onSelectOrganism}
                stateHint={stepFoodId === id ? '먹히는 생물로 선택됨' : undefined}
              />
            </div>
          );
        })}
      </div>

      {/* 연결 목록 — 접근성 + 작은 화면 대체 */}
      <ul className="fweb-link-list" aria-label="연결한 먹이 관계 목록">
        {links.map((l) => (
          <li key={l.relationId}>
            <span aria-label={linkAriaLabel(l)}>
              <span className="fweb-link-list__food">{getOrganism(l.foodId)?.name}</span>
              <span className="fweb-link-list__arrow" aria-hidden="true">→</span>
              <span className="fweb-link-list__eater">{getOrganism(l.eaterId)?.name}</span>
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
        {links.length === 0 && <li className="fweb-empty">아직 연결한 먹이 관계가 없어요. 단서를 읽고 연결해 보세요.</li>}
      </ul>
    </div>
  );
}
