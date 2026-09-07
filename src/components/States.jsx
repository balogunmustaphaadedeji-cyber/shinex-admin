export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="shx-table-wrap">
      <table className="shx-table">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}><div className="shx-skel" style={{ height: 14, width: c === 0 ? '70%' : '90%' }} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function EmptyState({ title, description, action }) {
  return (
    <div className="shx-state">
      <p className="shx-state__title">{title}</p>
      {description && <p className="shx-state__desc">{description}</p>}
      {action}
    </div>
  );
}
export function ErrorState({ title = "Couldn't load this", description, onRetry }) {
  return (
    <div className="shx-state">
      <p className="shx-state__title" style={{ color: 'var(--shx-red-600)' }}>{title}</p>
      {description && <p className="shx-state__desc">{description}</p>}
      {onRetry && <button className="shx-btn shx-btn--outline" onClick={onRetry}>Try again</button>}
    </div>
  );
}
