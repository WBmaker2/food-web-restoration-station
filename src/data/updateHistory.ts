export type UpdateHistoryEntry = {
  date: string;
  summary: string;
};

/** 학생·교사가 현재 앱의 개선 내용을 짧게 확인할 수 있는 기록. */
export const UPDATE_HISTORY: UpdateHistoryEntry[] = [
  { date: '2026-08-22', summary: '학생 흐름 브라우저 테스트와 배포 전 CI 검증을 추가했어요.' },
  { date: '2026-08-22', summary: '관계 연결 피드백과 대체 먹이 계산 기준을 안정화했어요.' },
  { date: '2026-08-22', summary: '큰 화면 카드 선택과 작은 화면 단계형 연결을 분리했어요.' },
  { date: '2026-08-22', summary: '모바일 잘림, 키보드 접근성, 진행 버튼 강조를 개선했어요.' },
  { date: '2026-08-02', summary: '버튼 용어를 쉽게 바꾸고 다음 미션 이동을 추가했어요.' },
  { date: '2026-07-28', summary: '디자인과 한국어 문법을 다듬고 초등학생 친화적으로 개선했어요.' },
  { date: '2026-07-27', summary: '먹이망 연결 복원소 MVP를 처음 설계했어요.' },
];
