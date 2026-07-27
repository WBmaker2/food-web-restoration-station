// 한국어 조사(助詞) 처리 유틸리티.
// 단어의 마지막 글자 받침(종성) 여부에 따라 올바른 조사를 선택한다.
// "이(가)", "은(는)" 처럼 양쪽을 병기하면 글이 어색해지므로 실제 단어에 맞춘다.

/** 단어의 마지막 한글 글자에 받침(종성)이 있는지. 한글이 아니면 받침 없음으로 간주. */
export function hasBatchim(word: string): boolean {
  const trimmed = word.trim();
  if (trimmed.length === 0) return false;
  const last = trimmed.slice(-1);
  const code = last.charCodeAt(0);
  // 한글 음절 범위(가~힣)가 아니면 받침 없음 처리
  if (code < 0xac00 || code > 0xd7a3) return false;
  const offset = code - 0xac00;
  const jong = offset % 28; // 종성 인덱스. 0이면 종성 없음.
  return jong !== 0;
}

/** 주격 조사: 받침 있으면 '이', 없으면 '가'. (예: 풀이 / 메뚜기가) */
export const iGa = (word: string): string => (hasBatchim(word) ? `${word}이` : `${word}가`);

/** 보조사 '은/는': 받침 있으면 '은', 없으면 '는'. (예: 풀은 / 메뚜기는) */
export const eunNeun = (word: string): string => (hasBatchim(word) ? `${word}은` : `${word}는`);

/** 목적격 조사 '을/를': 받침 있으면 '을', 없으면 '를'. (예: 풀을 / 메뚜기를) */
export const eulReul = (word: string): string => (hasBatchim(word) ? `${word}을` : `${word}를`);

/** 접속 조사 '와/과': 받침 있으면 '과', 없으면 '와'. (예: 풀과 / 메뚜기와) */
export const waGwa = (word: string): string => (hasBatchim(word) ? `${word}과` : `${word}와`);

/** 방향 조사 '(으)로': 받침 있으면 '으로', 없으면 '로'.
 *  단, 받침이 'ㄹ'인 경우는 예외적으로 '로'를 쓴다(예: 들로). */
export const euroRo = (word: string): string => {
  const last = word.trim().slice(-1);
  // 'ㄹ' 받침(종성 인덱스 8)이면 '로'
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jong = (code - 0xac00) % 28;
    if (jong === 8) return `${word}로`; // ㄹ 종성
  }
  return hasBatchim(word) ? `${word}으로` : `${word}로`;
};

/** 주격 보조 '이(가)' → 올바른 형태로. 이름이 이미 결합된 문자열 정리용. */
export const josa = {
  iGa,
  eunNeun,
  eulReul,
  waGwa,
  euroRo,
};
