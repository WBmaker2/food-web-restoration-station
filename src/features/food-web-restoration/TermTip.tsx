import { useState, useId } from 'react';

type Props = {
  /** 어려운 용어 (예: '포식 압력') */
  term: string;
  /** 초등학생용 쉬운 풀이 */
  help: string;
  children?: React.ReactNode;
};

// 어려운 용어 풀이 컴포넌트.
// 초등학생이 어려운 말을 만나면 마우스오버(데스크탑) / 탭(모바일)으로 쉬운 풀이를 봄.
// 접근성: 키보드 포커스로도 열리고, 화면 낭독기가 읽을 수 있음.
// hover/focus 와 click 이 독립 동작하도록 두 상태를 분리 (충돌 방지).
export function TermTip({ term, help, children }: Props) {
  const [hoverOpen, setHoverOpen] = useState(false);
  const [clickOpen, setClickOpen] = useState(false);
  const tipId = useId();
  const open = hoverOpen || clickOpen;

  return (
    <span className="term-tip">
      <button
        type="button"
        className={`term-tip__btn ${open ? 'is-open' : ''}`}
        aria-describedby={tipId}
        aria-expanded={open}
        onClick={() => setClickOpen(o => !o)}
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
        onFocus={() => setHoverOpen(true)}
        onBlur={() => setHoverOpen(false)}
      >
        {children ?? term}
        <span className="term-tip__mark" aria-hidden="true">?</span>
      </button>
      {open && (
        <span className="term-tip__help" id={tipId} role="tooltip" onClick={() => setClickOpen(false)}>
          {help}
        </span>
      )}
    </span>
  );
}

/** 자주 쓰는 어려운 용어의 풀이 사전. */
export const TERM_HELP: Record<string, string> = {
  '포식 압력': '잡아먹는 동물이 많으면 그만큼 많이 잡혀 먹힌다는 뜻이에요. 잡아먹는 동물이 줄면 덜 잡혀 먹혀요.',
  '간접 영향': '직접 연결되지는 않았지만, 건너건너 영향을 받는 것. 예: 풀이 줄면 뱀도 간접으로 영향을 받아요.',
  '직접 영향': '바로 연결된 관계로 받는 영향. 예: 메뚜기가 줄면 메뚜기를 먹는 개구리가 바로 영향을 받아요.',
  '대체 먹이': '다른 먹이가 또 있는 것. 예: 개구리가 메뚜기와 작은 곤충을 둘 다 먹으면, 메뚜기가 없어도 작은 곤충이 남아 있어요.',
  '생산자': '햇빛으로 스스로 양분을 만드는 식물. 풀, 들꽃 같은 식물이에요.',
  '소비자': '다른 생물을 먹고 사는 동물. 풀을 먹는 메뚜기, 메뚜기를 먹는 개구리 모두 소비자예요.',
  '분해자': '죽은 생물이나 배설물을 분해해 거름이 되게 하는 생물. 버섯, 흙 속 미생물이 있어요.',
  '먹이사슬': '누가 누구를 먹는지 한 줄로 이은 것. 예: 풀 → 메뚜기 → 개구리.',
  '먹이망': '여러 먹이사슬이 서로 연결된 그물 모양. 생물들이 복잡하게 연결돼 있어요.',
  '단정': '반드시 그렇다고 확정하는 것. 자연에서는 예외가 많아서 함부로 단정하기 어려워요.',
  '복원': '잃어버리거나 흩어진 것을 다시 제자리로 돌려놓는 것. 여기서는 연결을 다시 이어 붙이는 활동이에요.',
  '예측': '앞으로 어떻게 될지 미리 생각해 보는 것.',
};
