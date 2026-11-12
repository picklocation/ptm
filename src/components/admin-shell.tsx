import Link from "next/link";
import { Logo } from "./ui";
import type { Staff } from "@/lib/types";
export function AdminShell({
  staff,
  children,
}: {
  staff: Staff;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Logo />
        <nav aria-label="Admin navigation">
          <Link href="/adminportal">Overview</Link>
          {staff.role !== "enquiries" && (
            <Link href="/adminportal/content">Content & media</Link>
          )}
          {staff.role !== "editor" && (
            <Link href="/adminportal/enquiries">Enquiries</Link>
          )}
          {staff.role === "owner" && (
            <>
              <Link href="/adminportal/settings">Site settings & FAQs</Link>
              <Link href="/adminportal/staff">Staff & access</Link>
              <Link href="/adminportal/audit">Audit history</Link>
            </>
          )}
          <Link href="/" target="_blank">
            View website ↗
          </Link>
          <Link href="/adminportal/logout">Sign out</Link>
        </nav>
        <span className="muted">
          {staff.email}
          <br />
          {staff.role}
        </span>
      </aside>
      <main id="main" className="admin-main">
        {children}
      </main>
    </div>
  );
}
