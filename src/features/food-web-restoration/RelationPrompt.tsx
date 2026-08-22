import { useState } from 'react';
import { FEEDING_RELATIONS } from '../../data/feedingRelations';
import { getOrganism } from '../../data/foodWebOrganisms';
import { describeAddLinkResult } from '../../data/feedbackRules';
import type { AddLinkResult } from '../../lib/foodWebGraph';
import { eulReul } from '../../lib/koreanPostpositions';

type Props = {
  /** 이 미션에서 연결해야 할 관계와 참고 후보 id 목록. */
  candidateRelationIds: string[];
  /** 이미 연결된 relation id. */
  connectedRelationIds: string[];
  /** 정답 집합. 선택 후보에 오답이 섞여도 남은 수를 정확히 계산한다. */
  expectedRelationIds: string[];
  expectedCount: number;
  onAddRelationByPair: (foodId: string, eaterId: string) => AddLinkResult;
};

// 넓은 화면: 그래프에서 카드 두 장을 선택하고, 이 패널은 단서 참고용으로 사용.
// 작은 화면: 1) 먹히는 생물 선택 2) 먹는 생물 선택 3) 연결 확인.
type Step = {
  phase: 'pick-food' | 'pick-eater' | 'confirm';
  foodId: string | null;
  eaterId: string | null;
};

export function RelationPrompt({
  candidateRelationIds,
  connectedRelationIds,
  expectedRelationIds,
  expectedCount,
  onAddRelationByPair,
}: Props) {
  const [step, setStep] = useState<Step>({ phase: 'pick-food', foodId: null, eaterId: null });
  const [feedback, setFeedback] = useState<string | null>(null);

  const candidates = candidateRelationIds
    .map((id) => FEEDING_RELATIONS.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const connected = new Set(connectedRelationIds);
  const matchedCount = expectedRelationIds.filter((id) => connected.has(id)).length;
  const remaining = Math.max(0, expectedCount - matchedCount);

  const chooseFood = (foodId: string) => {
    setStep({ phase: 'pick-eater', foodId, eaterId: null });
    setFeedback(null);
  };

  const chooseEater = (eaterId: string) => {
    if (!step.foodId) return;
    setStep({ phase: 'confirm', foodId: step.foodId, eaterId });
  };

  const confirmConnect = () => {
    if (!step.foodId || !step.eaterId) return;
    const res = onAddRelationByPair(step.foodId, step.eaterId);
    setFeedback(describeAddLinkResult(res));
    setStep({ phase: 'pick-food', foodId: null, eaterId: null });
  };

  const resetStep = () => {
    setStep({ phase: 'pick-food', foodId: null, eaterId: null });
    setFeedback(null);
  };

  // 단계형 모드용 후보 생물 목록(단서에 등장하는 생물만).
  const foodIds = [...new Set(candidates.map((r) => r.foodId))];
  const eaterIds = step.foodId
    ? [...new Set(candidates.filter((r) => r.foodId === step.foodId).map((r) => r.eaterId))]
    : [];

  return (
    <section className="relation-prompt" aria-label="관계 단서와 연결">
      <h2 className="relation-prompt__title">관계 단서</h2>
      <p className="relation-prompt__hint" aria-live="polite">
        남은 연결 수: <strong>{remaining}</strong> / {expectedCount}
      </p>
      <p className="relation-prompt__mode-hint">
        <span className="relation-prompt__desktop-hint">
          큰 화면에서는 위 생물 카드를 <strong>먹히는 생물 → 먹는 생물</strong> 순서로 눌러 연결하세요.
        </span>
        <span className="relation-prompt__mobile-hint">
          아래 단계에서 <strong>먹히는 생물 → 먹는 생물</strong> 순서로 선택하세요.
        </span>
      </p>

      {/* 단서 참고 영역: 확인 전 정답 화살표를 노출하지 않는다. */}
      <div className="relation-prompt__clues" aria-label="먹이 관계 단서 목록">
        {candidates.map((r) => {
          const done = connected.has(r.id);
          return (
            <article
              key={r.id}
              className={`clue-card ${done ? 'is-done' : ''} ${r.confidence === 'possible' ? 'is-possible' : ''}`}
              aria-label={`단서: ${r.clue} ${r.confidence === 'possible' ? '대체 먹이 후보.' : '확정 관계 단서.'} ${done ? '이미 연결됨.' : ''}`}
            >
              <span className="clue-card__clue">{r.clue}</span>
              <span className="clue-card__conf">
                {r.confidence === 'possible' ? '대체 먹이 후보' : '확정 관계 단서'}
                {done ? ' · 연결됨' : ''}
              </span>
            </article>
          );
        })}
      </div>

      {/* 작은 화면용 3단계 버튼 흐름 */}
      <div className="relation-prompt__steps" aria-label="단계별 연결">
        <p className="relation-prompt__step-status" aria-live="polite">
          {step.phase === 'pick-food' && '1단계: 먹히는 생물을 고르세요.'}
          {step.phase === 'pick-eater' && `2단계: ${eulReul(getOrganism(step.foodId!)?.name ?? '')} 먹는 생물을 고르세요.`}
          {step.phase === 'confirm' && `3단계: ${getOrganism(step.foodId!)?.name} → ${getOrganism(step.eaterId!)?.name} 연결을 확인하세요.`}
        </p>

        {step.phase === 'pick-food' && (
          <div className="step-choices">
            {foodIds.map((id) => (
              <button key={id} type="button" className="step-choice" onClick={() => chooseFood(id)}>
                {getOrganism(id)?.icon} {getOrganism(id)?.name}
              </button>
            ))}
          </div>
        )}
        {step.phase === 'pick-eater' && (
          <div className="step-choices">
            {eaterIds.map((id) => (
              <button key={id} type="button" className="step-choice" onClick={() => chooseEater(id)}>
                {getOrganism(id)?.icon} {getOrganism(id)?.name}
              </button>
            ))}
          </div>
        )}
        {step.phase === 'confirm' && (
          <div className="step-choices">
            <button type="button" className="step-choice step-choice--primary" onClick={confirmConnect}>
              연결 확인
            </button>
            <button type="button" className="step-choice" onClick={resetStep}>
              다시 선택
            </button>
          </div>
        )}
      </div>

      {feedback && (
        <p className="relation-prompt__feedback" role="status" aria-live="polite">
          {feedback}
        </p>
      )}
    </section>
  );
}
