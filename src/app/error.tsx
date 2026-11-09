"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container page-main empty-state">
      <h1>A small detour.</h1>
      <p>
        We couldn’t load this page. The service may be temporarily unavailable.
        Please try again later.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
      <a className="text-link" href="https://wa.me/917902220044">
        Contact PickTheMap on WhatsApp
      </a>
    </main>
  );
}
