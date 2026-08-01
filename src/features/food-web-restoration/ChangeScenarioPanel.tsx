import type { ChangeScenario } from '../../data/types';
import { getOrganism } from '../../data/foodWebOrganisms';
import { CHANGE_LABEL, LEVEL_LABEL } from '../../data/changeScenarios';
import { iGa } from '../../lib/koreanPostpositions';

type Props = {
  scenario: ChangeScenario;
  /** 사건 발동 전(초기) 수준. */
  beforeLevels?: Record<string, 'low' | 'medium' | 'high'>;
  /** 사건 발동 후(가상 결과) 수준. */
  afterLevels?: Record<string, 'low' | 'medium' | 'high'>;
  /** 현재 단계 — 진행 가이드에 사용. */
  phase?: 'restore' | 'predict' | 'result';
};

// 사건 패널: 변화 전·후 상태, 고정 조건, 그리고 "지금 뭘 해야 하는지" 가이드.
// 초등학생이 헤매지 않도록 단계별 안내를 상단에 명확히.
export function ChangeScenarioPanel({ scenario, beforeLevels, afterLevels, phase = 'restore' }: Props) {
  const trigger = scenario.trigger;
  const triggerOrg = getOrganism(trigger.organismId);

  const guide: Record<string, { icon: string; text: React.ReactNode }> = {
    restore: { icon: '🔗', text: <>아래 <strong>단서</strong>를 읽고 카드를 연결해 먹이 관계를 만드세요.</> },
    predict: { icon: '🤔', text: <>연결한 관계를 보고, 각 생물이 <strong>어떻게 변할지</strong> 예측해 보세요.</> },
    result: { icon: '✨', text: <>내 예측과 <strong>실제 결과</strong>를 비교하고, 다르면 생각을 고쳐 보세요.</> },
  };

  return (
    <section className="scenario-panel" aria-label="변화 사건">
      {/* 진행 가이드 — 초등학생이 "지금 뭘 해야 하나?" 헤매지 않도록 */}
      <div className="scenario-panel__guide" role="note">
        <span className="scenario-panel__guide-icon" aria-hidden="true">{guide[phase].icon}</span>
        <p>{guide[phase].text}</p>
      </div>

      <div className="scenario-panel__event">
        <span className="scenario-panel__event-icon" aria-hidden="true">⚡</span>
        <p>
          사건: <strong>{iGa(triggerOrg?.name ?? '')}</strong>{' '}
          <strong>{CHANGE_LABEL[trigger.change]}</strong>
        </p>
      </div>

      <div className="scenario-panel__conditions">
        <h3>이 미션에서는요…</h3>
        <ul>
          {scenario.fixedConditions.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      {(beforeLevels || afterLevels) && (
        <div className="scenario-panel__compare">
          <div className="scenario-panel__col">
            <h4>변하기 전</h4>
            <StateList levels={beforeLevels ?? {}} />
          </div>
          <span className="scenario-panel__arrow" aria-hidden="true">→</span>
          <div className="scenario-panel__col">
            <h4>변한 뒤(가상 결과)</h4>
            <StateList levels={afterLevels ?? {}} />
          </div>
        </div>
      )}
    </section>
  );
}

function StateList({ levels }: { levels: Record<string, 'low' | 'medium' | 'high'> }) {
  const ids = Object.keys(levels);
  if (ids.length === 0) return <p className="scenario-empty">-</p>;
  return (
    <ul className="scenario-state-list">
      {ids.map((id) => {
        const o = getOrganism(id);
        return (
          <li key={id}>
            <span aria-hidden="true">{o?.icon}</span>
            <span>{o?.name ?? id}</span>
            <span className={`state-tag state-${levels[id]}`}>{LEVEL_LABEL[levels[id]]}</span>
          </li>
        );
      })}
    </ul>
  );
}
