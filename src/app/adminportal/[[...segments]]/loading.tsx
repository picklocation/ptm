// Shown the moment an admin link is clicked, while the page's data loads.
export default function Loading() {
  return (
    <div className="admin-shell" aria-busy="true">
      <aside className="admin-sidebar" />
      <main className="admin-main">
        <p className="muted" role="status">
          Loading…
        </p>
      </main>
    </div>
  );
}
