import { useState } from 'react';
import { CHANGE_SCENARIOS } from '../../data/changeScenarios';

type Props = {
  onStart: (scenarioId: string) => void;
  reduceMotion: boolean;
  onToggleReduceMotion: (v: boolean) => void;
};

// 시작 화면.
// 화살표 규칙을 고정 문장으로 명시하고, 서식지 안내와 업데이트 내역을 제공 (문서 5.1, 12.1, 20).
export function HabitatIntro({ onStart, reduceMotion, onToggleReduceMotion }: Props) {
  const [showLog, setShowLog] = useState(false);

  return (
    <div className="habitat-intro">
      <h1 className="habitat-intro__title">먹이망 연결 복원소</h1>
      <p className="habitat-intro__subtitle">
        가상 초원의 생물 카드로 먹이 관계를 복원하고, 변화가 어떻게 이어지는지 추론해 보세요.
      </p>

      {/* 화살표 규칙 — 첫 화면에서 고정 문장으로 명시 */}
      <div className="habitat-intro__rule" role="note">
        <h2>화살표 규칙</h2>
        <p className="habitat-intro__rule-text">
          화살표는 <strong>먹히는 생물에서 먹는 생물 쪽</strong>으로 그립니다.
        </p>
        <p className="habitat-intro__example">
          예: 풀 → 메뚜기 → 개구리
        </p>
        <p className="habitat-intro__rule-note">
          화살표는 에너지가 옮아가는 방향을 보여 줄 뿐, 공격 방향이나 이동 경로가 아니에요.
        </p>
      </div>

      <div className="habitat-intro__habitat">
        <h2>서식지</h2>
        <p>이 앱은 <strong>가상 초원</strong> 한 곳을 탐구합니다. 실제 생태계 전체를 재현한 게 아니에요.</p>
        <ul>
          <li>모든 생물과 관계는 '이 가상 초원의 규칙'이에요.</li>
          <li>서버 없이 브라우저에서만 돌아가고, 새로고침하면 처음 상태로 돌아가요.</li>
          <li>점수 게임이 아니라, 관계 구조를 복원하고 변화의 방향을 근거로 설명하는 활동이에요.</li>
        </ul>
      </div>

      <div className="habitat-intro__missions">
        <h2>미션 선택</h2>
        <ul>
          {CHANGE_SCENARIOS.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => onStart(s.id)}>
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="habitat-intro__settings">
        <label className="habitat-intro__motion-toggle">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => onToggleReduceMotion(e.target.checked)}
          />
          모션 줄이기
        </label>
      </div>

      <div className="habitat-intro__changelog">
        <button
          type="button"
          className="habitat-intro__changelog-btn"
          aria-expanded={showLog}
          onClick={() => setShowLog((v) => !v)}
        >
          업데이트 내역 {showLog ? '닫기' : '열기'}
        </button>
        {showLog && (
          <table className="habitat-intro__changelog-table">
            <caption>업데이트 내역</caption>
            <thead>
              <tr><th scope="col">날짜</th><th scope="col">내용</th></tr>
            </thead>
            <tbody>
              <tr><td>2026-07-27</td><td>최초 MVP 설계: 먹이망 복원과 연쇄 변화 예측</td></tr>
              <tr><td>구현일</td><td>초원 카드·6개 미션·영향 설명 추가</td></tr>
              <tr><td>개선일</td><td>대체 먹이와 간접 영향 피드백 보강 (예정)</td></tr>
              <tr><td>개선일</td><td>모바일 단계형 연결과 키보드 접근성 개선 (예정)</td></tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
