import { useState } from 'react';
import { getOrganism } from '../../data/foodWebOrganisms';
import type { ChangeKind, InfluenceResult } from '../../data/types';
import { getReasoningTemplates, DIRECTION_OPTIONS, renderReasoningSentence } from '../../data/feedbackRules';
import type { Prediction, ReasoningSentence } from './useFoodWebState';
import { TermTip } from './TermTip';

type Props = {
  organismIds: string[];
  influences: InfluenceResult[];
  predictions: Record<string, Prediction>;
  reasoning: ReasoningSentence[];
  /** 사건의 변화 종류 — 근거 문장 템플릿 맥락에 사용. */
  change: ChangeKind;
  onPredict: (organismId: string, p: Prediction) => void;
  onAddReasoning: (sentence: ReasoningSentence) => void;
  onRemoveReasoning: (index: number) => void;
};

const OPTIONS: { value: Prediction; label: string }[] = [
  { value: 'increase', label: '늘어남' },
  { value: 'decrease', label: '줄어듦' },
  { value: 'no-change', label: '변화 없음' },
];

// 직접(사건 대상으로부터 1단계)과 간접(2단계 이상)을 구분해 표시한다.
export function PredictionPanel({
  organismIds,
  influences,
  predictions,
  reasoning,
  change,
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
        바로 연결된 생물부터 예측하고, <TermTip term="간접 영향" help="직접 연결되지는 않았지만 건너건너 영향을 받는 것. 풀이 줄면 뱀도 간접으로 영향을 받아요.">건너 연결</TermTip>은 가능성으로만 생각해 보세요.
      </p>

      <h3>바로 연결된 생물 <span className="prediction-panel__step-badge">먼저 예측!</span></h3>
      {directIds.length === 0 && <p>아직 바로 연결된 생물이 없어요. 먼저 먹이 관계를 연결해 보세요.</p>}
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
          <h3>건너 연결 생물 <span className="prediction-panel__step-badge is-indirect">조금 어려워요</span></h3>
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
        change={change}
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
  change,
  onAdd,
  onRemove,
}: {
  organismIds: string[];
  reasoning: ReasoningSentence[];
  change: ChangeKind;
  onAdd: (s: ReasoningSentence) => void;
  onRemove: (i: number) => void;
}) {
  const templates = getReasoningTemplates(change);
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [filled, setFilled] = useState<Record<string, string>>({});
  const tpl = templates.find((t) => t.id === templateId) ?? templates[0];

  /** 공유 렌더러로 위임. 사건 종류(change)를 넘겨 맥락에 맞는 템플릿 사용. */
  const renderSentence = (t: typeof tpl, f: Record<string, string>) =>
    renderReasoningSentence(t.id, f, change);

  const add = () => {
    onAdd({ templateId, filled });
    setFilled({});
  };

  // slot 이름 → 초등학생용 친화적 라벨
  const slotLabel: Record<string, string> = {
    food: '줄어든/없어진 생물',
    eater: '영향 받는 생물',
    predator: '줄어든/없어진 생물',
    prey: '남은 생물',
    alt: '다른 먹이',
    a: '생물 1',
    b: '생물 2',
    dir: '방향',
  };

  return (
    <details className="reasoning-builder">
      <summary className="reasoning-builder__summary">
        ✏️ 근거 문장 만들기 <span className="reasoning-builder__count">{reasoning.length > 0 && `(${reasoning.length}개)`}</span>
      </summary>
      <p className="reasoning-builder__guide">왜 그렇게 생각했는지 문장으로 적어 보세요. (선택)</p>
      <select value={templateId} onChange={(e) => { setTemplateId(e.target.value); setFilled({}); }}>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>{renderSentence(t, {})}</option>
        ))}
      </select>
      <div className="reasoning-builder__slots">
        {tpl.slots.map((slot) => (
          <label key={slot}>
            <span>{slotLabel[slot] ?? slot}</span>
            {slot === 'dir' ? (
              <select value={filled[slot] ?? ''} onChange={(e) => setFilled({ ...filled, [slot]: e.target.value })}>
                <option value="">선택…</option>
                {DIRECTION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <select value={filled[slot] ?? ''} onChange={(e) => setFilled({ ...filled, [slot]: e.target.value })}>
                <option value="">생물 선택…</option>
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
          const t = templates.find((x) => x.id === r.templateId) ?? templates[0];
          return (
            <li key={i}>
              <span>{renderSentence(t, r.filled)}</span>
              <button type="button" onClick={() => onRemove(i)} aria-label={`${i + 1}번 문장 삭제`}>삭제</button>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
