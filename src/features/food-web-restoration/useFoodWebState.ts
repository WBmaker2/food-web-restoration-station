import { useCallback, useMemo, useState } from 'react';
import { FEEDING_RELATIONS } from '../../data/feedingRelations';
import { CHANGE_SCENARIOS, INITIAL_POPULATIONS } from '../../data/changeScenarios';
import type { ChangeScenario, PopulationLevel } from '../../data/types';
import {
  addLinkByPair,
  removeLink,
  clearLinks,
  gradeRestoration,
  type RestoredLink,
} from '../../lib/foodWebGraph';
import { computeInfluences } from '../../lib/influenceEngine';

// 학생이 예측한 한 생물의 변화 방향. 엔진 Influence 와 별개.
export type Prediction = 'increase' | 'decrease' | 'no-change';

export type ReasoningSentence = {
  templateId: string;
  filled: Record<string, string>;
};

export type Screen = 'intro' | 'mission';

export type MissionState = {
  scenarioId: string;
  links: RestoredLink[];
  predictions: Record<string, Prediction>;
  reasoning: ReasoningSentence[];
};

export function relationToRestoredLink(relationId: string): RestoredLink | undefined {
  const relation = FEEDING_RELATIONS.find((r) => r.id === relationId);
  return relation
    ? { relationId: relation.id, foodId: relation.foodId, eaterId: relation.eaterId }
    : undefined;
}

const EMPTY_MISSIONS: Record<string, MissionState> = {};

export function useFoodWebState() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [missions, setMissions] = useState<Record<string, MissionState>>(EMPTY_MISSIONS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(CHANGE_SCENARIOS[0].id);
  const [reduceMotion, setReduceMotion] = useState(false);

  const active = missions[activeScenarioId] ?? {
    scenarioId: activeScenarioId,
    links: [],
    predictions: {},
    reasoning: [],
  };

  /** 현재 미션의 활성 생물 id 목록(관계 후보·사건 대상·현재 선택에 등장하는 생물). */
  const activeOrganismIds = useMemo(() => {
    const scenario = CHANGE_SCENARIOS.find((s) => s.id === activeScenarioId);
    if (!scenario) return [] as string[];
    const ids = new Set<string>();
    ids.add(scenario.trigger.organismId);
    const relationIds = new Set([
      ...scenario.expectedRelations,
      ...scenario.choiceRelationIds,
      ...active.links.map((link) => link.relationId),
    ]);
    for (const rid of relationIds) {
      const rel = FEEDING_RELATIONS.find((r) => r.id === rid);
      if (rel) {
        ids.add(rel.foodId);
        ids.add(rel.eaterId);
      }
    }
    return [...ids];
  }, [active.links, activeScenarioId]);

  /** 미션 상태 갱신 헬퍼. */
  const updateActive = useCallback(
    (fn: (m: MissionState) => MissionState) => {
      setMissions((prev) => {
        const cur = prev[activeScenarioId] ?? {
          scenarioId: activeScenarioId,
          links: [],
          predictions: {},
          reasoning: [],
        };
        return { ...prev, [activeScenarioId]: fn(cur) };
      });
    },
    [activeScenarioId],
  );

  const addRelationByPair = useCallback(
    (foodId: string, eaterId: string) => {
      const result = addLinkByPair(active.links, foodId, eaterId, FEEDING_RELATIONS);
      if (result.ok) updateActive((m) => ({ ...m, links: [...m.links, result.link] }));
      return result;
    },
    [active.links, updateActive],
  );

  const removeRelation = useCallback(
    (relationId: string) => {
      updateActive((m) => ({ ...m, links: removeLink(m.links, relationId) }));
    },
    [updateActive],
  );

  const resetMissionState = useCallback(() => {
    updateActive((m) => ({
      ...m,
      links: clearLinks(m.links),
      predictions: {},
      reasoning: [],
    }));
  }, [updateActive]);

  const scenarioLinks = useMemo(() => {
    const scenario = CHANGE_SCENARIOS.find((s) => s.id === activeScenarioId);
    return scenario
      ? scenario.expectedRelations
          .map(relationToRestoredLink)
          .filter((link): link is RestoredLink => Boolean(link))
      : [];
  }, [activeScenarioId]);

  const setPrediction = useCallback(
    (organismId: string, p: Prediction) => {
      updateActive((m) => ({
        ...m,
        predictions: { ...m.predictions, [organismId]: p },
      }));
    },
    [updateActive],
  );

  const addReasoning = useCallback(
    (sentence: ReasoningSentence) => {
      updateActive((m) => ({ ...m, reasoning: [...m.reasoning, sentence] }));
    },
    [updateActive],
  );

  const removeReasoning = useCallback(
    (index: number) => {
      updateActive((m) => ({
        ...m,
        reasoning: m.reasoning.filter((_, i) => i !== index),
      }));
    },
    [updateActive],
  );

  /** 사건 발동 시 가상 결과(influence 결과) 계산. */
  const virtualResults = useMemo(() => {
    const scenario = CHANGE_SCENARIOS.find((s) => s.id === activeScenarioId);
    if (!scenario) return [];
    // 결과는 학생이 일부만 복원했는지가 아니라, 이 미션에서 제시한 기준 먹이망을 사용한다.
    // 학생의 복원 상태는 grade와 화면의 연결 목록에서 별도로 보여 준다.
    return computeInfluences(scenarioLinks, scenario.trigger, INITIAL_POPULATIONS, activeOrganismIds);
  }, [activeScenarioId, activeOrganismIds, scenarioLinks]);

  /** 복원 채점. */
  const grade = useMemo(() => {
    const scenario = CHANGE_SCENARIOS.find((s) => s.id === activeScenarioId);
    if (!scenario) return { matched: [], missing: [], extra: [] };
    return gradeRestoration(active.links, scenario.expectedRelations);
  }, [activeScenarioId, active.links]);

  const scenario: ChangeScenario | undefined = CHANGE_SCENARIOS.find(
    (s) => s.id === activeScenarioId,
  );

  const startMission = useCallback((scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    setScreen('mission');
  }, []);

  const goIntro = useCallback(() => setScreen('intro'), []);

  /** 현재 미션의 다음 미션 id. 마지막 미션이면 null. */
  const nextScenarioId = useMemo(() => {
    const idx = CHANGE_SCENARIOS.findIndex((s) => s.id === activeScenarioId);
    if (idx < 0 || idx >= CHANGE_SCENARIOS.length - 1) return null;
    return CHANGE_SCENARIOS[idx + 1].id;
  }, [activeScenarioId]);

  /** 다음 미션으로 이동. 다음이 없으면(마지막 미션) 시작 화면으로. */
  const goNextMission = useCallback(() => {
    if (nextScenarioId) {
      setActiveScenarioId(nextScenarioId);
      setScreen('mission');
    } else {
      setScreen('intro');
    }
  }, [nextScenarioId]);

  return {
    screen,
    reduceMotion,
    setReduceMotion,
    activeScenarioId,
    scenario,
    active,
    activeOrganismIds,
    addRelationByPair,
    removeRelation,
    resetMissionState,
    setPrediction,
    addReasoning,
    removeReasoning,
    virtualResults,
    scenarioLinks,
    grade,
    startMission,
    goIntro,
    nextScenarioId,
    goNextMission,
  };
}

export type UseFoodWebState = ReturnType<typeof useFoodWebState>;

/** 수준 한글 라벨(컴포넌트 공용). */
export const LEVEL_LABEL: Record<PopulationLevel, string> = {
  low: '적음',
  medium: '보통',
  high: '많음',
};
