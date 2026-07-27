import type { OrganismCard as OrganismCardData } from '../../data/types';
import { ROLE_LABEL } from '../../data/foodWebOrganisms';
import { cardAriaLabel } from '../../lib/accessibilityLabels';

type Props = {
  organism: OrganismCardData;
  selected?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
  level?: string;
  onSelect?: (id: string) => void;
  /** 화면 낭독기용 추가 설명 (예: "선택됨"). */
  stateHint?: string;
};

// 색상만으로 역할을 구분하지 않는다: 아이콘 + 글자(역할명) + 색을 함께 표시 (문서 13, 12.3).
// 터치 영역은 44px 이상(CSS에서 보장).
export function OrganismCard({
  organism,
  selected,
  highlighted,
  dimmed,
  level,
  onSelect,
  stateHint,
}: Props) {
  const interactive = Boolean(onSelect);
  const className = [
    'org-card',
    `role-${organism.role}`,
    selected ? 'is-selected' : '',
    highlighted ? 'is-highlighted' : '',
    dimmed ? 'is-dimmed' : '',
    interactive ? 'is-interactive' : '',
  ].join(' ');
  const ariaLabel = cardAriaLabel(organism.id) + (stateHint ? ` ${stateHint}` : '');
  const handleClick = interactive ? () => onSelect?.(organism.id) : undefined;

  const inner = (
    <>
      <span className="org-card__icon" aria-hidden="true">{organism.icon}</span>
      <span className="org-card__name">{organism.name}</span>
      <span className="org-card__role-tag">{ROLE_LABEL[organism.role]}</span>
      {level && <span className="org-card__level">수준: {level}</span>}
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        className={className}
        data-role={organism.role}
        aria-label={ariaLabel}
        aria-pressed={Boolean(selected)}
        onClick={handleClick}
      >
        {inner}
      </button>
    );
  }
  return (
    <div className={className} data-role={organism.role} aria-label={ariaLabel}>
      {inner}
    </div>
  );
}
