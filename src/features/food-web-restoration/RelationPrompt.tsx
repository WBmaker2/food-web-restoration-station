import { useState } from 'react';
import { FEEDING_RELATIONS } from '../../data/feedingRelations';
import { getOrganism } from '../../data/foodWebOrganisms';
import type { AddLinkResult } from '../../lib/foodWebGraph';
import { eulReul, iGa } from '../../lib/koreanPostpositions';

type Props = {
  /** 이 미션에서 연결해야 할 관계 후보 id 목록. */
  candidateRelationIds: string[];
  /** 이미 연결된 relation id. */
  connectedRelationIds: string[];
  expectedCount: number;
  onAddRelation: (relationId: string) => AddLinkResult;
};

// 관계 단서 패널.
// 넓은 화면: 단서 카드를 클릭해 바로 연결.
// 작은 화면(단계형): 1) 먹히는 생물 선택 2) 먹는 생물 선택 3) 연결 확인 (문서 12.2).
type Step = { phase: 'pick-food' | 'pick-eater' | 'confirm'; foodId: string | null; eaterId: string | null };

export function RelationPrompt({
  candidateRelationIds,
  connectedRelationIds,
  expectedCount,
  onAddRelation,
}: Props) {
  const [step, setStep] = useState<Step>({ phase: 'pick-food', foodId: null, eaterId: null });
  const [feedback, setFeedback] = useState<string | null>(null);

  const candidates = candidateRelationIds
    .map((id) => FEEDING_RELATIONS.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const connected = new Set(connectedRelationIds);
  const remaining = Math.max(0, expectedCount - connectedRelationIds.length);

  /** 단서 직접 클릭(넓은 화면). */
  const handleDirect = (relationId: string) => {
    const res = onAddRelation(relationId);
    setFeedback(describeResult(res));
  };

  /** 단계형: 먹히는 생물 클릭. */
  const chooseFood = (foodId: string) => {
    setStep({ phase: 'pick-eater', foodId, eaterId: null });
    setFeedback(null);
  };

  /** 단계형: 먹는 생물 클릭. */
  const chooseEater = (eaterId: string) => {
    if (!step.foodId) return;
    setStep({ phase: 'confirm', foodId: step.foodId, eaterId });
  };

  /** 단계형: 연결 확인. 후보에서 일치 관계를 찾아 추가. */
  const confirmConnect = () => {
    if (!step.foodId || !step.eaterId) return;
    const match = candidates.find(
      (r) => r.foodId === step.foodId && r.eaterId === step.eaterId,
    );
    if (!match) {
      // 방향이 반대일 가능성 안내.
      const reversed = candidates.find(
        (r) => r.foodId === step.eaterId && r.eaterId === step.foodId,
      );
      setFeedback(
        reversed
          ? '화살표는 먹히는 생물에서 먹는 생물 쪽으로 그려요. 방향을 다시 확인해 보세요.'
          : '이 두 생물은 이 미션의 먹이 관계 후보에 없어요. 단서를 다시 읽어보세요.',
      );
      return;
    }
    const res = onAddRelation(match.id);
    setFeedback(describeResult(res));
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

      {/* 넓은 화면용: 단서 카드 직접 클릭 */}
      <div className="relation-prompt__clues">
        {candidates.map((r) => {
          const done = connected.has(r.id);
          return (
            <button
              key={r.id}
              type="button"
              className={`clue-card ${done ? 'is-done' : ''} ${r.confidence === 'possible' ? 'is-possible' : ''}`}
              onClick={() => handleDirect(r.id)}
              disabled={done}
              aria-label={`단서: ${eulReul(getOrganism(r.foodId)?.name ?? '')} ${iGa(getOrganism(r.eaterId)?.name ?? '')} 먹음. ${r.confidence === 'possible' ? '대체 먹이 후보.' : ''} ${done ? '이미 연결됨.' : '연결하려면 선택.'}`}
            >
              <span className="clue-card__clue">{r.clue}</span>
              <span className="clue-card__arrow">
                {getOrganism(r.foodId)?.name} → {getOrganism(r.eaterId)?.name}
              </span>
              <span className="clue-card__conf">
                {r.confidence === 'possible' ? '대체 먹이 후보' : '확정 관계'}
              </span>
            </button>
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
        <p className="relation-prompt__feedback" role="status">
          {feedback}
        </p>
      )}
    </section>
  );
}

function describeResult(res: AddLinkResult): string {
  if (res.ok) return '연결했어요. 화살표는 먹히는 생물에서 먹는 생물 쪽이에요.';
  switch (res.reason) {
    case 'duplicate':
      return '이미 연결한 관계예요. 한 번만 저장해요.';
    case 'self-loop':
      return '자기 자신을 먹는 연결은 할 수 없어요.';
    case 'decomposer':
      return '분해자는 죽은 생물과 유기물을 분해하는 역할을 해요. 포식 관계에 넣지 않아요.';
    case 'reversed':
      return '화살표는 먹히는 생물에서 먹는 생물 쪽으로 그려요. 방향을 확인해 보세요.';
    default:
      return '이 관계는 이 미션에 없어요.';
  }
}
