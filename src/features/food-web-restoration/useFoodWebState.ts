import { useCallback, useMemo, useState } from 'react';
import { FEEDING_RELATIONS } from '../../data/feedingRelations';
import { CHANGE_SCENARIOS, INITIAL_POPULATIONS } from '../../data/changeScenarios';
import type { ChangeScenario, PopulationLevel } from '../../data/types';
import {
  addLink,
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

  /** 현재 미션의 활성 생물 id 목록(정답 관계에 등장하는 생물 + 사건 대상). */
  const activeOrganismIds = useMemo(() => {
    const scenario = CHANGE_SCENARIOS.find((s) => s.id === activeScenarioId);
    if (!scenario) return [] as string[];
    const ids = new Set<string>();
    ids.add(scenario.trigger.organismId);
    for (const rid of scenario.expectedRelations) {
      const rel = FEEDING_RELATIONS.find((r) => r.id === rid);
      if (rel) {
        ids.add(rel.foodId);
        ids.add(rel.eaterId);
      }
    }
    return [...ids];
  }, [activeScenarioId]);

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

  /** 연결 추가. UI 피드백을 위해 결과 반환. */
  const addRelation = useCallback(
    (relationId: string) => {
      let result: ReturnType<typeof addLink> = { ok: false, reason: 'unknown-relation' };
      updateActive((m) => {
        const res = addLink(m.links, relationId, FEEDING_RELATIONS);
        result = res;
        if (res.ok) return { ...m, links: [...m.links, res.link] };
        return m;
      });
      return result;
    },
    [updateActive],
  );

  const removeRelation = useCallback(
    (relationId: string) => {
      updateActive((m) => ({ ...m, links: removeLink(m.links, relationId) }));
    },
    [updateActive],
  );

  const resetLinks = useCallback(() => {
    updateActive((m) => ({ ...m, links: clearLinks(m.links) }));
  }, [updateActive]);

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
    // 빈 먹이망이면 정답 관계로 결과를 보여줌(학생이 다 그리지 않아도 결과 비교 가능).
    const baseLinks =
      active.links.length > 0
        ? active.links
        : scenario.expectedRelations
            .map((rid) => FEEDING_RELATIONS.find((r) => r.id === rid))
            .filter((r): r is NonNullable<typeof r> => Boolean(r))
            .map((r) => ({ relationId: r.id, foodId: r.foodId, eaterId: r.eaterId }));
    return computeInfluences(baseLinks, scenario.trigger, INITIAL_POPULATIONS, activeOrganismIds);
  }, [activeScenarioId, active.links, activeOrganismIds]);

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

  return {
    screen,
    reduceMotion,
    setReduceMotion,
    activeScenarioId,
    scenario,
    active,
    activeOrganismIds,
    addRelation,
    removeRelation,
    resetLinks,
    setPrediction,
    addReasoning,
    removeReasoning,
    virtualResults,
    grade,
    startMission,
    goIntro,
  };
}

export type UseFoodWebState = ReturnType<typeof useFoodWebState>;

/** 수준 한글 라벨(컴포넌트 공용). */
export const LEVEL_LABEL: Record<PopulationLevel, string> = {
  low: '적음',
  medium: '보통',
  high: '많음',
};
