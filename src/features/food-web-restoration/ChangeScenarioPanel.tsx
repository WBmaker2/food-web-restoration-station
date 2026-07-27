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
};

// 사건 패널: 변화 전·후 상태와 고정 조건을 보여준다.
// '이 미션의 조건에서는' 프레이밍을 항상 표시 (문서 10.2).
export function ChangeScenarioPanel({ scenario, beforeLevels, afterLevels }: Props) {
  const trigger = scenario.trigger;
  const triggerOrg = getOrganism(trigger.organismId);

  return (
    <section className="scenario-panel" aria-label="변화 사건">
      <h2 className="scenario-panel__title">{scenario.title}</h2>

      <div className="scenario-panel__event">
        <span className="scenario-panel__event-icon" aria-hidden="true">⚡</span>
        <p>
          사건: <strong>{iGa(triggerOrg?.name ?? '')}</strong>{' '}
          <strong>{CHANGE_LABEL[trigger.change]}</strong>
        </p>
      </div>

      <div className="scenario-panel__conditions">
        <h3>이 미션의 조건에서는</h3>
        <ul>
          {scenario.fixedConditions.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      {(beforeLevels || afterLevels) && (
        <div className="scenario-panel__compare">
          <div className="scenario-panel__col">
            <h4>변화 전</h4>
            <StateList levels={beforeLevels ?? {}} />
          </div>
          <span className="scenario-panel__arrow" aria-hidden="true">→</span>
          <div className="scenario-panel__col">
            <h4>변화 후(가상 결과)</h4>
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
