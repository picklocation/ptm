"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function AdminLogin({ firebase }: { firebase: boolean }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const f = new FormData(e.currentTarget);
        const email = String(f.get("email")),
          password = String(f.get("password"));
        try {
          let idToken = "";
          if (firebase) {
            const { initializeApp, getApps } = await import("firebase/app");
            const {
              getAuth,
              signInWithEmailAndPassword,
              connectAuthEmulator,
              signOut,
            } = await import("firebase/auth");
            const app =
              getApps()[0] ||
              initializeApp({
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              });
            const auth = getAuth(app);
            if (
              process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL &&
              !auth.emulatorConfig
            )
              connectAuthEmulator(
                auth,
                process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL,
              );
            const credential = await signInWithEmailAndPassword(
              auth,
              email,
              password,
            );
            idToken = await credential.user.getIdToken();
            await signOut(auth);
          }
          const r = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, idToken }),
          });
          const j = await r.json();
          if (!r.ok) throw new Error(j.error);
          router.push("/adminportal");
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Unable to sign in.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
      <label className="field">
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label className="field">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={12}
        />
      </label>
      <button className="button" disabled={busy}>
        {busy ? "Signing in…" : "Sign in securely →"}
      </button>
      <p className="small-note">
        Access is restricted to provisioned PickTheMap staff.
      </p>
    </form>
  );
}
