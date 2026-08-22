import { useState } from 'react';
import { UPDATE_HISTORY } from '../../data/updateHistory';

type Props = {
  compact?: boolean;
};

export function UpdateLog({ compact = false }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`update-log ${compact ? 'update-log--compact' : ''}`}>
      <button
        type="button"
        className="update-log__button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        업데이트 내역
      </button>
      {open && (
        <table className="update-log__table">
          <caption>업데이트 내역</caption>
          <thead>
            <tr><th scope="col">날짜</th><th scope="col">내용</th></tr>
          </thead>
          <tbody>
            {UPDATE_HISTORY.map((entry) => (
              <tr key={`${entry.date}-${entry.summary}`}>
                <td>{entry.date}</td>
                <td>{entry.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
