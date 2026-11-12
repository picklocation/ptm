"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowUpRight,
  Compass,
  Map,
  MessageCircle,
} from "lucide-react";
import { Logo } from "./ui";
const links = [
  ["International", "/international-trips"],
  ["Domestic", "/domestic-trips"],
  ["Resorts & Stays", "/resorts-and-stays"],
  ["Europe road trips", "/europe-road-trips"],
  ["Visa-free", "/visa-free-destinations"],
];
export function Header() {
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    dialog.current?.close();
    setOpen(false);
  }, [path]);
  if (path.startsWith("/adminportal")) return null;
  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Logo />
          <nav aria-label="Main navigation" className="desktop-nav">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={path.startsWith(href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/plan-my-trip" className="button small header-cta">
            Plan my trip
            <ArrowUpRight size={16} />
          </Link>
          <button
            className="icon-button menu-toggle"
            aria-label="Open navigation"
            aria-expanded={open}
            onClick={() => {
              dialog.current?.showModal();
              setOpen(true);
            }}
          >
            <Menu size={23} />
          </button>
        </div>
      </header>
      <dialog
        ref={dialog}
        className="mobile-menu"
        aria-label="Site navigation"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="menu-top">
          <Logo />
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
          <Link href="/contact">
            Contact & FAQs
            <ArrowUpRight size={18} />
          </Link>
        </nav>
        <Link href="/plan-my-trip" className="button">
          Let’s plan your trip
          <ArrowUpRight size={18} />
        </Link>
        <p className="muted">A place in mind. A journey made yours.</p>
      </dialog>
      {!path.includes("/plan-my-trip") && path.split("/").length < 3 && (
        <nav className="mobile-bottom" aria-label="Quick navigation">
          <Link href="/" aria-current={path === "/" ? "page" : undefined}>
            <Compass size={19} />
            Explore
          </Link>
          <Link
            href="/holidays"
            aria-current={path === "/holidays" ? "page" : undefined}
          >
            <Map size={19} />
            Holidays
          </Link>
          <Link href="/plan-my-trip">
            <MessageCircle size={19} />
            Plan my trip
          </Link>
        </nav>
      )}
    </>
  );
}
