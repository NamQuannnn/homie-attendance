export function LoadingState() {
  return (
    <div
      className="app skeleton-page"
      role="status"
      aria-label="Đang tải dữ liệu"
    >
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-month" />
      <div className="skeleton skeleton-summary" />
      <div className="summary-grid">
        <div className="skeleton skeleton-metric" />
        <div className="skeleton skeleton-metric" />
        <div className="skeleton skeleton-metric" />
      </div>
      <div className="skeleton skeleton-title" />
      <div className="card">
        {[1, 2, 3, 4].map((n) => (
          <div className="skeleton-row" key={n}>
            <div className="skeleton skeleton-avatar" />
            <div className="skeleton skeleton-name" />
          </div>
        ))}
      </div>
      <span className="sr-only">Đang tải dữ liệu Supabase…</span>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="report-list" role="status" aria-label="Đang tải báo cáo">
      {[1, 2, 3].map((n) => (
        <div className="card report-skeleton" key={n}>
          <div className="skeleton skeleton-name" />
          <div className="report-metrics">
            {[1, 2, 3].map((i) => (
              <div className="skeleton skeleton-report-metric" key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
