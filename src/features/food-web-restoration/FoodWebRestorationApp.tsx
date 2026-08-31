import { useEffect, useRef, useState } from 'react';
import { useFoodWebState } from './useFoodWebState';
import { HabitatIntro } from './HabitatIntro';
import { FoodWebCanvas } from './FoodWebCanvas';
import { RelationPrompt } from './RelationPrompt';
import { ChangeScenarioPanel } from './ChangeScenarioPanel';
import { PredictionPanel } from './PredictionPanel';
import { ResultCard } from './ResultCard';
import { INITIAL_POPULATIONS } from '../../data/changeScenarios';
import { getOrganism } from '../../data/foodWebOrganisms';
import { describeAddLinkResult } from '../../data/feedbackRules';
import { UpdateLog } from './UpdateLog';

type MissionPhase = 'restore' | 'predict' | 'result';

// 최상위 앱. 미션 단계(복원 → 예측 → 결과)를 전환한다.
// 서버 없이 브라우저에서만 동작한다 (문서 6).
export function FoodWebRestorationApp() {
  const st = useFoodWebState();
  const [phase, setPhase] = useState<MissionPhase>('restore');
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [canvasFeedback, setCanvasFeedback] = useState<string | null>(null);
  const phaseHeadingRef = useRef<HTMLHeadingElement>(null);
  const skipLink = <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>;

  // 화면 단계가 바뀌면 새 화면의 시작점으로 이동해, 긴 페이지에서 다음 단계가
  // 중간부터 보이는 문제를 막는다. 제목에 초점을 보내 키보드 사용자도 위치를 알 수 있게 한다.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (st.screen === 'mission') {
      phaseHeadingRef.current?.focus({ preventScroll: true });
    }
  }, [st.screen, st.activeScenarioId, phase]);

  if (st.screen === 'intro' || !st.scenario) {
    return (
      <>
        {skipLink}
        <HabitatIntro
          onStart={(id) => {
            st.startMission(id);
            setPhase('restore');
            setSelectedFoodId(null);
            setCanvasFeedback(null);
          }}
          reduceMotion={st.reduceMotion}
          onToggleReduceMotion={st.setReduceMotion}
        />
      </>
    );
  }

  const scenario = st.scenario;
  const connectedIds = st.active.links.map((l) => l.relationId);
  const isArrowTraining = scenario.learningMode === 'arrow';
  const expectedMatchedCount = st.grade.matched.length;
  const canAdvance = st.grade.missing.length === 0;
  const directPredictionIds = st.virtualResults
    .filter((inf) => inf.distance === 1)
    .map((inf) => inf.organismId);
  const predictedDirectCount = directPredictionIds.filter((id) => Boolean(st.active.predictions[id])).length;
  const canAdvanceToResult = directPredictionIds.every((id) => Boolean(st.active.predictions[id]));

  const handleCanvasOrganismSelect = (id: string) => {
    if (!selectedFoodId) {
      setSelectedFoodId(id);
      setCanvasFeedback(`${getOrganism(id)?.name ?? id}을 먹히는 생물로 골랐어요. 이제 먹는 생물을 고르세요.`);
      return;
    }
    const result = st.addRelationByPair(selectedFoodId, id);
    setCanvasFeedback(describeAddLinkResult(result));
    setSelectedFoodId(null);
  };

  // 사건 전·후 수준. after는 가상 결과에서 level을 모아 만든다.
  const beforeLevels: Record<string, 'low' | 'medium' | 'high'> = {};
  for (const id of st.activeOrganismIds) {
    beforeLevels[id] = (INITIAL_POPULATIONS[id] ?? 'medium') as 'low' | 'medium' | 'high';
  }
  const afterLevels: Record<string, 'low' | 'medium' | 'high'> = {};
  for (const inf of st.virtualResults) {
    afterLevels[inf.organismId] = inf.level;
  }

  return (
    <>
      {skipLink}
      <main id="main-content" className={`fwr-app ${st.reduceMotion ? 'is-reduce-motion' : ''}`}>
      <header className="fwr-header">
        <button type="button" className="fwr-home" onClick={() => {
          st.goIntro();
          setSelectedFoodId(null);
          setCanvasFeedback(null);
        }}>
          ← 처음으로
        </button>
        <h1 ref={phaseHeadingRef} tabIndex={-1}>{scenario.title}</h1>
        <span className="fwr-phase" aria-live="polite">
          {phase === 'restore' && '1단계: 먹이망 복원'}
          {phase === 'predict' && '2단계: 변화 예측'}
          {phase === 'result' && '3단계: 결과 비교'}
        </span>
        <div className="fwr-header__tools">
          <label className="fwr-header__motion">
            <input
              type="checkbox"
              checked={st.reduceMotion}
              onChange={(event) => st.setReduceMotion(event.target.checked)}
            />
            움직임 줄이기
          </label>
          <UpdateLog compact />
        </div>
      </header>

      <ChangeScenarioPanel
        scenario={scenario}
        phase={phase}
        beforeLevels={phase === 'result' ? beforeLevels : undefined}
        afterLevels={phase === 'result' ? afterLevels : undefined}
      />

      {phase === 'restore' && (
        <>
          <FoodWebCanvas
            organismIds={st.activeOrganismIds}
            links={st.active.links}
            selectedId={selectedFoodId}
            onSelectOrganism={handleCanvasOrganismSelect}
            onRemoveLink={st.removeRelation}
          />
          {canvasFeedback && (
            <p className="relation-canvas-feedback" role="status" aria-live="polite">
              {canvasFeedback}
            </p>
          )}
          <RelationPrompt
            candidateRelationIds={scenario.choiceRelationIds}
            connectedRelationIds={connectedIds}
            expectedRelationIds={scenario.expectedRelations}
            expectedCount={scenario.expectedRelations.length}
            onAddRelationByPair={st.addRelationByPair}
          />
          <div className="fwr-actions">
            <button
              type="button"
              onClick={() => {
                st.resetMissionState();
                setSelectedFoodId(null);
                setCanvasFeedback(null);
              }}
            >
              모두 지우고 다시
            </button>
            <button
              type="button"
              className="fwr-next gi-pulse"
              onClick={() => {
                setSelectedFoodId(null);
                setCanvasFeedback(null);
                if (isArrowTraining) {
                  st.goNextMission();
                  setPhase('restore');
                } else {
                  setPhase('predict');
                }
              }}
              disabled={!canAdvance}
            >
              {isArrowTraining
                ? '다음: 먹이망 복원하기 →'
                : `다음: 변화 예측하기 (${expectedMatchedCount}/${scenario.expectedRelations.length}) →`}
            </button>
            {!isArrowTraining && !canAdvance && (
              <p className="fwr-action-hint" role="status">
                남은 연결을 모두 찾으면 다음 단계로 갈 수 있어요.
              </p>
            )}
          </div>
        </>
      )}

      {phase === 'predict' && !isArrowTraining && (
        <>
          <FoodWebCanvas
            organismIds={st.activeOrganismIds}
            links={st.scenarioLinks}
            influences={st.virtualResults}
            canvasLabel="미션 기준 먹이망과 영향 거리"
            linkListLabel="미션 기준 먹이 관계 목록"
          />
          <PredictionPanel
            organismIds={st.activeOrganismIds}
            influences={st.virtualResults}
            predictions={st.active.predictions}
            reasoning={st.active.reasoning}
            change={scenario.trigger.change}
            onPredict={st.setPrediction}
            onAddReasoning={st.addReasoning}
            onRemoveReasoning={st.removeReasoning}
          />
          <div className="fwr-actions">
            <button type="button" onClick={() => setPhase('restore')}>← 이전 단계</button>
            <button
              type="button"
              className="fwr-next gi-pulse"
              onClick={() => setPhase('result')}
              disabled={!canAdvanceToResult}
            >
              다음: 결과 비교하기 ({predictedDirectCount}/{directPredictionIds.length}) →
            </button>
            {!canAdvanceToResult && (
              <p className="fwr-action-hint" role="status">
                바로 연결된 생물의 변화를 모두 고르면 결과를 확인할 수 있어요.
              </p>
            )}
          </div>
        </>
      )}

      {phase === 'result' && !isArrowTraining && (
        <>
          <FoodWebCanvas
            organismIds={st.activeOrganismIds}
            links={st.scenarioLinks}
            influences={st.virtualResults}
            canvasLabel="미션 기준 먹이망과 영향 결과"
            linkListLabel="미션 기준 먹이 관계 목록"
          />
          <ResultCard
            scenario={scenario}
            predictions={st.active.predictions}
            influences={st.virtualResults}
            reasoning={st.active.reasoning}
            matchedCount={st.grade.matched.length}
            expectedCount={scenario.expectedRelations.length}
            missingRelationIds={st.grade.missing}
            extraRelationIds={st.grade.extra}
            change={scenario.trigger.change}
            reduceMotion={st.reduceMotion}
          />
          <div className="fwr-actions fwr-actions--result">
            <button type="button" onClick={() => setPhase('predict')}>예측 고치기</button>
            <button type="button" onClick={() => {
              st.resetMissionState();
              setSelectedFoodId(null);
              setCanvasFeedback(null);
              setPhase('restore');
            }}>
              이 단계 다시하기
            </button>
            <button type="button" className="fwr-next gi-pulse" onClick={() => { st.goNextMission(); setPhase('restore'); }}>
              {st.nextScenarioId ? `다음 미션으로 넘어가기 →` : `모두 끝났어요! 처음으로 →`}
            </button>
          </div>
        </>
      )}

      <footer className="fwr-footer">
        <p>이 가상 초원의 조건에서 정리한 결과예요. 실제 자연 전체의 법칙으로 보면 안 돼요.</p>
      </footer>
      </main>
    </>
  );
}
