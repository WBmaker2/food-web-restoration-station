import { useState } from 'react';
import { CHANGE_SCENARIOS } from '../../data/changeScenarios';
import { UpdateLog } from './UpdateLog';

type Props = {
  onStart: (scenarioId: string) => void;
  reduceMotion: boolean;
  onToggleReduceMotion: (v: boolean) => void;
};

// 시작 화면 — 초등학생 친화적 간소화.
// 핵심 원칙: 긴 안내문을 3줄로, 시작 버튼을 크게, 상세는 접기.
// Swiss 영감: 큰 타이포그래피, 대담한 여백, 명확한 위계.
export function HabitatIntro({ onStart, reduceMotion, onToggleReduceMotion }: Props) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <main id="main-content" className="habitat-intro">
      {/* 히어로 — 큰 제목 + 한 줄 요약 + 즉시 시작 */}
      <section className="habitat-hero">
        <h1 className="habitat-hero__title">먹이망<br />연결 복원소</h1>
        <p className="habitat-hero__lead">
          생물 카드를 연결해서 <strong>먹이 관계</strong>를 만들고,
          <br />
          한 생물이 변하면 <strong>다른 생물이 어떻게 달라지는지</strong> 알아보세요.
        </p>
        <button
          type="button"
          className="habitat-hero__start"
          onClick={() => onStart(CHANGE_SCENARIOS[0].id)}
        >
          🌿 처음부터 시작하기 (미션 0)
        </button>
        <p className="habitat-hero__hint">처음이라면 미션 0부터 차근차근!</p>
      </section>

      {/* 핵심 규칙 — 딱 3줄. 긴 설명은 접기 */}
      <section className="habitat-rule-card">
        <h2 className="habitat-rule-card__title">🎯 딱 3가지만 기억해요</h2>
        <ol className="habitat-rule-card__list">
          <li>
            <span className="habitat-rule-card__num">1</span>
            <span>화살표는 <strong>먹히는 생물 → 먹는 생물</strong> 쪽으로 그려요. (예: 풀 → 메뚜기)</span>
          </li>
          <li>
            <span className="habitat-rule-card__num">2</span>
            <span>단서를 읽고 카드를 연결해 <strong>먹이사슬</strong>을 만들어요.</span>
          </li>
          <li>
            <span className="habitat-rule-card__num">3</span>
            <span>한 생물이 변하면 연결된 생물이 <strong>어떻게 달라지는지</strong> 예측해요.</span>
          </li>
        </ol>
        <button
          type="button"
          className="habitat-rule-card__more"
          aria-expanded={showDetail}
          onClick={() => setShowDetail(v => !v)}
        >
          {showDetail ? '접기 ▲' : '더 자세한 설명 보기 ▼'}
        </button>
        {showDetail && (
          <div className="habitat-rule-card__detail">
            <p>• 화살표는 에너지가 옮아가는 방향이에요. 공격하는 방향이 아니에요.</p>
            <p>• 이 앱은 <strong>가상 초원</strong> 한 곳을 탐구해요. 실제 자연 전체와는 달라요.</p>
            <p>• 점수 게임이 아니라, 내 생각을 정리하는 활동이에요. 틀려도 괜찮아요!</p>
            <p>• 새로고침하면 처음으로 돌아가요. 저장은 되지 않아요.</p>
          </div>
        )}
      </section>

      {/* 미션 선택 — 간결하게 */}
      <section className="habitat-missions">
        <h2 className="habitat-missions__title">미션 고르기</h2>
        <p className="habitat-missions__sub">하고 싶은 미션을 골라보세요. 어려운 미션은 🌟 표시.</p>
        <ul className="habitat-missions__list">
          {CHANGE_SCENARIOS.map((s, i) => {
            const stars = i <= 1 ? 0 : i <= 3 ? 1 : 2;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={`habitat-missions__btn ${i === 0 ? 'is-first' : ''}`}
                  onClick={() => onStart(s.id)}
                >
                  <span className="habitat-missions__num">미션 {i}</span>
                  <span className="habitat-missions__name">{missionShortName(s.title)}</span>
                  <span className="habitat-missions__diff" aria-label={`어려움 ${stars}단계`}>
                    {'🌟'.repeat(stars)}
                    {stars === 0 && <span className="habitat-missions__easy">쉬워요</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 설정 + 업데이트 — 하단, 눈에 덜 띄게 */}
      <section className="habitat-bottom">
        <label className="habitat-bottom__motion">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => onToggleReduceMotion(e.target.checked)}
          />
          움직임 줄이기
        </label>
        <UpdateLog />
      </section>
    </main>
  );
}

/** 미션 제목에서 '미션 N:' 접두어 제거한 짧은 이름. */
function missionShortName(title: string): string {
  return title.replace(/^미션\s*\d+\s*:\s*/, '');
}
