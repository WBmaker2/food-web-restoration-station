import { useState } from 'react';
import { getOrganism } from '../../data/foodWebOrganisms';
import type { InfluenceResult } from '../../data/types';
import { REASONING_TEMPLATES, DIRECTION_OPTIONS, renderReasoningSentence } from '../../data/feedbackRules';
import type { Prediction, ReasoningSentence } from './useFoodWebState';

type Props = {
  organismIds: string[];
  influences: InfluenceResult[];
  predictions: Record<string, Prediction>;
  reasoning: ReasoningSentence[];
  onPredict: (organismId: string, p: Prediction) => void;
  onAddReasoning: (sentence: ReasoningSentence) => void;
  onRemoveReasoning: (index: number) => void;
};

const OPTIONS: { value: Prediction; label: string }[] = [
  { value: 'increase', label: '늘어' },
  { value: 'decrease', label: '줄어' },
  { value: 'no-change', label: '변화 없음' },
];

// 직접(사건 대상으로부터 1단계)과 간접(2단계 이상)을 구분해 표시한다.
export function PredictionPanel({
  organismIds,
  influences,
  predictions,
  reasoning,
  onPredict,
  onAddReasoning,
  onRemoveReasoning,
}: Props) {
  const distById: Record<string, number> = {};
  for (const inf of influences) distById[inf.organismId] = inf.distance;

  const directIds = organismIds.filter((id) => distById[id] === 1);
  const indirectIds = organismIds.filter((id) => distById[id] >= 2);

  return (
    <section className="prediction-panel" aria-label="변화 예측">
      <h2>변화 예측하기</h2>
      <p className="prediction-panel__hint">
        직접 연결된 생물부터 예측하고, 간접 영향은 가능성으로 생각해 보세요.
      </p>

      <h3>직접 연결된 생물</h3>
      {directIds.length === 0 && <p>아직 직접 연결된 생물이 없어요. 먼저 먹이망을 복원해 보세요.</p>}
      <div className="prediction-grid">
        {directIds.map((id) => (
          <PredictionRow
            key={id}
            organismId={id}
            selected={predictions[id]}
            onSelect={(p) => onPredict(id, p)}
          />
        ))}
      </div>

      {indirectIds.length > 0 && (
        <>
          <h3>간접 연결 생물 (두 단계 이상)</h3>
          <div className="prediction-grid prediction-grid--indirect">
            {indirectIds.map((id) => (
              <PredictionRow
                key={id}
                organismId={id}
                selected={predictions[id]}
                onSelect={(p) => onPredict(id, p)}
                indirect
              />
            ))}
          </div>
        </>
      )}

      <ReasoningBuilder
        organismIds={organismIds}
        reasoning={reasoning}
        onAdd={onAddReasoning}
        onRemove={onRemoveReasoning}
      />
    </section>
  );
}

function PredictionRow({
  organismId,
  selected,
  onSelect,
  indirect,
}: {
  organismId: string;
  selected?: Prediction;
  onSelect: (p: Prediction) => void;
  indirect?: boolean;
}) {
  const o = getOrganism(organismId)!;
  return (
    <div className={`prediction-row ${indirect ? 'is-indirect' : ''}`} role="radiogroup" aria-label={`${o.name}의 변화 예측`}>
      <span className="prediction-row__name" aria-hidden="true">{o.icon} {o.name}</span>
      <div className="prediction-row__options">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected === opt.value}
            className={`pred-option ${selected === opt.value ? 'is-selected' : ''}`}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReasoningBuilder({
  organismIds,
  reasoning,
  onAdd,
  onRemove,
}: {
  organismIds: string[];
  reasoning: ReasoningSentence[];
  onAdd: (s: ReasoningSentence) => void;
  onRemove: (i: number) => void;
}) {
  const [templateId, setTemplateId] = useState(REASONING_TEMPLATES[0].id);
  const [filled, setFilled] = useState<Record<string, string>>({});
  const tpl = REASONING_TEMPLATES.find((t) => t.id === templateId)!;

  /** 공유 렌더러로 위임. */
  const renderSentence = (t: typeof tpl, f: Record<string, string>) =>
    renderReasoningSentence(t.id, f);

  const add = () => {
    onAdd({ templateId, filled });
    setFilled({});
  };

  return (
    <div className="reasoning-builder">
      <h3>근거 문장 만들기</h3>
      <select value={templateId} onChange={(e) => { setTemplateId(e.target.value); setFilled({}); }}>
        {REASONING_TEMPLATES.map((t) => (
          <option key={t.id} value={t.id}>{renderSentence(t, {})}</option>
        ))}
      </select>
      <div className="reasoning-builder__slots">
        {tpl.slots.map((slot) => (
          <label key={slot}>
            <span>{slot}</span>
            {slot === 'dir' ? (
              <select value={filled[slot] ?? ''} onChange={(e) => setFilled({ ...filled, [slot]: e.target.value })}>
                <option value="">선택</option>
                {DIRECTION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <select value={filled[slot] ?? ''} onChange={(e) => setFilled({ ...filled, [slot]: e.target.value })}>
                <option value="">생물 선택</option>
                {organismIds.map((id) => (
                  <option key={id} value={getOrganism(id)?.name ?? id}>{getOrganism(id)?.name}</option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
      <p className="reasoning-builder__preview" aria-live="polite">
        미리 보기: {renderSentence(tpl, filled)}
      </p>
      <button type="button" className="reasoning-builder__add" onClick={add}>문장 추가</button>

      <ul className="reasoning-builder__list">
        {reasoning.map((r, i) => {
          const t = REASONING_TEMPLATES.find((x) => x.id === r.templateId)!;
          return (
            <li key={i}>
              <span>{renderSentence(t, r.filled)}</span>
              <button type="button" onClick={() => onRemove(i)} aria-label={`${i + 1}번 문장 삭제`}>삭제</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
