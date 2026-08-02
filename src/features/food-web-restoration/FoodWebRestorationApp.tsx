import { useState } from 'react';
import { useFoodWebState } from './useFoodWebState';
import { HabitatIntro } from './HabitatIntro';
import { FoodWebCanvas } from './FoodWebCanvas';
import { RelationPrompt } from './RelationPrompt';
import { ChangeScenarioPanel } from './ChangeScenarioPanel';
import { PredictionPanel } from './PredictionPanel';
import { ResultCard } from './ResultCard';
import { INITIAL_POPULATIONS } from '../../data/changeScenarios';

type MissionPhase = 'restore' | 'predict' | 'result';

// 최상위 앱. 미션 단계(복원 → 예측 → 결과)를 전환한다.
// 서버 없이 브라우저에서만 동작한다 (문서 6).
export function FoodWebRestorationApp() {
  const st = useFoodWebState();
  const [phase, setPhase] = useState<MissionPhase>('restore');

  if (st.screen === 'intro' || !st.scenario) {
    return (
      <HabitatIntro
        onStart={(id) => { st.startMission(id); setPhase('restore'); }}
        reduceMotion={st.reduceMotion}
        onToggleReduceMotion={st.setReduceMotion}
      />
    );
  }

  const scenario = st.scenario;
  const connectedIds = st.active.links.map((l) => l.relationId);

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
    <div className={`fwr-app ${st.reduceMotion ? 'is-reduce-motion' : ''}`}>
      <header className="fwr-header">
        <button type="button" className="fwr-home" onClick={st.goIntro}>
          ← 처음으로
        </button>
        <h1>{scenario.title}</h1>
        <span className="fwr-phase" aria-live="polite">
          {phase === 'restore' && '1단계: 먹이망 복원'}
          {phase === 'predict' && '2단계: 변화 예측'}
          {phase === 'result' && '3단계: 결과 비교'}
        </span>
      </header>

      <ChangeScenarioPanel
        scenario={scenario}
        phase={phase}
        beforeLevels={phase !== 'restore' ? beforeLevels : undefined}
        afterLevels={phase === 'result' ? afterLevels : undefined}
      />

      {phase === 'restore' && (
        <>
          <FoodWebCanvas
            organismIds={st.activeOrganismIds}
            links={st.active.links}
            onRemoveLink={st.removeRelation}
          />
          <RelationPrompt
            candidateRelationIds={scenario.expectedRelations}
            connectedRelationIds={connectedIds}
            expectedCount={scenario.expectedRelations.length}
            onAddRelation={st.addRelation}
          />
          <div className="fwr-actions">
            <button type="button" onClick={st.resetLinks}>모두 지우고 다시</button>
            <button
              type="button"
              className="fwr-next"
              onClick={() => setPhase('predict')}
              disabled={st.active.links.length === 0}
            >
              다음: 변화 예측하기 →
            </button>
          </div>
        </>
      )}

      {phase === 'predict' && (
        <>
          <FoodWebCanvas
            organismIds={st.activeOrganismIds}
            links={st.active.links}
            influences={st.virtualResults}
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
            <button type="button" className="fwr-next" onClick={() => setPhase('result')}>
              다음: 결과 비교하기 →
            </button>
          </div>
        </>
      )}

      {phase === 'result' && (
        <>
          <FoodWebCanvas
            organismIds={st.activeOrganismIds}
            links={st.active.links}
            influences={st.virtualResults}
          />
          <ResultCard
            scenario={scenario}
            predictions={st.active.predictions}
            influences={st.virtualResults}
            reasoning={st.active.reasoning}
            matchedCount={st.grade.matched.length}
            expectedCount={scenario.expectedRelations.length}
            change={scenario.trigger.change}
            reduceMotion={st.reduceMotion}
          />
          <div className="fwr-actions fwr-actions--result">
            <button type="button" onClick={() => setPhase('predict')}>예측 고치기</button>
            <button type="button" onClick={() => { st.resetLinks(); setPhase('restore'); }}>
              이 단계 다시하기
            </button>
            <button type="button" className="fwr-next" onClick={() => { st.goNextMission(); setPhase('restore'); }}>
              {st.nextScenarioId ? `다음 미션으로 넘어가기 →` : `모두 끝났어요! 처음으로 →`}
            </button>
          </div>
        </>
      )}

      <footer className="fwr-footer">
        <p>이 가상 초원의 조건에서 정리한 결과예요. 실제 자연 전체의 법칙으로 보면 안 돼요.</p>
      </footer>
    </div>
  );
}
