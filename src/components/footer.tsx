import Link from "next/link";
import { Logo } from "./ui";
import { FooterColumns } from "./footer-columns";
import { settings } from "@/lib/store";
const explore: [string, string][] = [
  ["International trips", "/international-trips"],
  ["Domestic trips", "/domestic-trips"],
  ["South India", "/south-india"],
  ["Visa-free destinations", "/visa-free-destinations"],
  ["Europe road trips", "/europe-road-trips"],
  ["Resorts & villas", "/resorts-and-villas"],
  ["Destinations", "/destinations"],
];
export async function Footer() {
  const s = await settings();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>A place in mind. A journey made yours.</p>
          <Link href="/plan-my-trip" className="button small">
            Plan my trip
          </Link>
        </div>
        <FooterColumns>
          <details className="footer-col" open>
            <summary>Find your next place</summary>
            <nav>
              {explore.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
          </details>
          <details className="footer-col" open>
            <summary>About &amp; help</summary>
            <nav>
              <Link href="/about">Our story</Link>
              <Link href="/faqs">Your questions, answered</Link>
              <Link href="/contact">Get in touch</Link>
            </nav>
          </details>
          <details className="footer-col" open>
            <summary>Let’s talk travel</summary>
            <nav>
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
            </nav>
          </details>
        </FooterColumns>
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
