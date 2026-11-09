import Link from "next/link";
import { Logo } from "./ui";
import { settings } from "@/lib/store";
export async function Footer() {
  const s = await settings();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            A place in mind.
            <br />A journey made yours.
          </p>
          <span className="muted">Custom holidays, thoughtful details.</span>
        </div>
        <div>
          <h3>Find your next place</h3>
          <Link href="/holidays">All holidays</Link>
          <Link href="/europe-road-trips">Europe road trips</Link>
          <Link href="/kerala-resorts">Kerala resorts</Link>
          <Link href="/destinations">Destinations</Link>
        </div>
        <div>
          <h3>A little about us</h3>
          <Link href="/about">Our story</Link>
          <Link href="/contact">Get in touch</Link>
          <Link href="/faqs">Your questions, answered</Link>
          <Link href="/plan-my-trip">Plan a personalised trip</Link>
        </div>
        <div>
          <h3>Let’s talk travel</h3>
          {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
          {s.phone && <a href={`tel:${s.phone}`}>{s.phone}</a>}
          {s.whatsapp && (
            <a
              href={`https://wa.me/${s.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp ↗
            </a>
          )}
          {s.instagram && (
            <a href={s.instagram} target="_blank" rel="noreferrer">
              Instagram ↗
            </a>
          )}
          <Link href="/plan-my-trip" className="text-link">
            Tell us your travel idea ↗
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} PickTheMap</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cancellation">Cancellation</Link>
        </div>
      </div>
    </footer>
  );
}
