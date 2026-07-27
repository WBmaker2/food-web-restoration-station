import { useMemo, useState } from 'react';
import { getOrganism } from '../../data/foodWebOrganisms';
import type { ChangeScenario, InfluenceResult } from '../../data/types';
import type { Prediction, ReasoningSentence } from './useFoodWebState';
import { INFLUENCE_LABEL } from '../../lib/influenceEngine';

type Props = {
  scenario: ChangeScenario;
  predictions: Record<string, Prediction>;
  influences: InfluenceResult[];
  reasoning: ReasoningSentence[];
  matchedCount: number;
  expectedCount: number;
  reduceMotion: boolean;
};

// 학생 예측과 가상 결과를 비교하고, 수정 문장을 남기며, 결과를 텍스트로 복사할 수 있게 한다.
// 점수가 아닌 복원한 관계망과 수정한 예측을 보여 준다 (문서 6, 19).
export function ResultCard({
  scenario,
  predictions,
  influences,
  reasoning,
  matchedCount,
  expectedCount,
  reduceMotion,
}: Props) {
  const [revision, setRevision] = useState('');
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => {
    return influences
      .filter((inf) => inf.distance !== Infinity || predictions[inf.organismId])
      .map((inf) => {
        const pred = predictions[inf.organismId];
        const predLabel = pred ? PRED_LABEL[pred] : '예측 안 함';
        const resultLabel = INFLUENCE_LABEL[inf.influence];
        const agree = predictionMatches(pred, inf.influence);
        return {
          id: inf.organismId,
          name: getOrganism(inf.organismId)?.name ?? inf.organismId,
          predLabel,
          resultLabel,
          agree,
          distance: inf.distance,
          reasons: inf.reasons,
        };
      });
  }, [influences, predictions]);

  const copyText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`[먹이망 연결 복원소 결과 — ${scenario.title}]`);
    lines.push(`복원한 관계: ${matchedCount} / ${expectedCount}`);
    lines.push('');
    lines.push('생물별 예측 vs 가상 결과:');
    for (const r of rows) {
      const mark = r.agree === true ? '일치' : r.agree === false ? '다름' : '-';
      lines.push(`- ${r.name} (거리 ${Number.isFinite(r.distance) ? r.distance : '∞'}): 예측 ${r.predLabel} / 결과 ${r.resultLabel} [${mark}]`);
    }
    if (reasoning.length > 0) {
      lines.push('');
      lines.push('근거 문장:');
      reasoning.forEach((s, i) => lines.push(`${i + 1}. ${s.filled ? JSON.stringify(s.filled) : ''} (틀 ${s.templateId})`));
    }
    if (revision.trim()) {
      lines.push('');
      lines.push(`수정한 생각: ${revision.trim()}`);
    }
    lines.push('');
    lines.push('이 가상 초원의 조건에서 정리한 결과예요. 실제 자연 전체의 법칙으로 보면 안 돼요.');
    return lines.join('\n');
  }, [scenario, matchedCount, expectedCount, rows, reasoning, revision]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 미지원 환경: 텍스트 영역를 보여줌.
      setCopied(false);
    }
  };

  return (
    <section className="result-card" aria-label="결과 카드">
      <h2>결과 비교</h2>

      <div className="result-card__restore">
        <h3>내가 복원한 먹이 관계</h3>
        <p>
          연결한 관계: <strong>{matchedCount}</strong> / {expectedCount}
          {matchedCount === expectedCount ? ' (모두 찾았어요!)' : ' (조금 더 찾아보세요.)'}
        </p>
      </div>

      <table className="result-card__table">
        <caption>생물별 내 예측과 가상 결과 비교</caption>
        <thead>
          <tr>
            <th scope="col">생물</th>
            <th scope="col">거리</th>
            <th scope="col">내 예측</th>
            <th scope="col">가상 결과</th>
            <th scope="col">비교</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <th scope="row">{r.name}</th>
              <td>{Number.isFinite(r.distance) ? r.distance : '∞'}</td>
              <td>{r.predLabel}</td>
              <td>{r.resultLabel}</td>
              <td className={r.agree === true ? 'agree' : r.agree === false ? 'disagree' : 'unknown'}>
                {r.agree === true ? '일치' : r.agree === false ? '다름' : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="result-card__reasons">
        <h3>결과 근거</h3>
        <ul>
          {rows.flatMap((r) => r.reasons.map((rs, i) => (
            <li key={`${r.id}-${i}`}>{r.name}: {rs}</li>
          )))}
        </ul>
      </div>

      <div className="result-card__revision">
        <label htmlFor="revision">예측이 결과와 다른 부분이 있다면, 어떻게 생각을 고칠지 적어보세요.</label>
        <textarea
          id="revision"
          value={revision}
          onChange={(e) => setRevision(e.target.value)}
          placeholder="예: 개구리가 다른 먹이도 있어서 바로 사라지진 않는다는 걸 몰랐어요."
          rows={3}
        />
      </div>

      <div className="result-card__share">
        <button type="button" onClick={handleCopy} aria-label="결과 텍스트 복사">
          결과 텍스트 복사
        </button>
        {copied && <span role="status">복사했어요!</span>}
        {!copied && (
          <details className="result-card__raw">
            <summary>텍스트로 보기</summary>
            <pre>{copyText}</pre>
          </details>
        )}
      </div>

      <div className="result-card__teacher-q">
        <h3>더 생각해 보기</h3>
        <p>이 가상 초원에서 어떤 생물의 변화가 가장 멀리 이어졌나요? 왜 그랬을까요?</p>
      </div>

      {!reduceMotion && (
        <p className="result-card__motion-hint">
          모션을 줄이려면 위쪽 설정에서 켜세요.
        </p>
      )}
    </section>
  );
}

const PRED_LABEL: Record<Prediction, string> = {
  increase: '늘어',
  decrease: '줄어',
  'no-change': '변화 없음',
};

/** 학생 예측과 엔진 결과가 방향에서 일치하는지. */
function predictionMatches(pred: Prediction | undefined, influence: string): boolean | null {
  if (!pred) return null;
  if (pred === 'no-change') return influence === 'no-direct-change';
  if (pred === 'increase') return influence === 'increase';
  if (pred === 'decrease') {
    return influence === 'decrease' || influence === 'decrease-possible' || influence === 'uncertain';
  }
  return null;
}
