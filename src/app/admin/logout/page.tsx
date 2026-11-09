"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Logout() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/admin/logout", { method: "POST" }).then(() => {
      router.replace("/admin/login");
      router.refresh();
    });
  }, [router]);
  return (
    <main id="main" className="page-main container">
      Signing out…
    </main>
  );
}
