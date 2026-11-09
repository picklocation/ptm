import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container page-main empty-state">
      <p className="eyebrow">A little off the map</p>
      <h1>Let’s find your way back.</h1>
      <p>This page may have moved or the trip is no longer published.</p>
      <Link href="/holidays" className="button">
        Explore holidays →
      </Link>
    </main>
  );
}
