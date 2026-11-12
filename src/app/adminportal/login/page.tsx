import { Logo } from "@/components/ui";
import { AdminLogin } from "@/components/admin-login";
import { firebaseMode } from "@/lib/store";
export const metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};
export default function Login() {
  return (
    <main id="main" className="login-page">
      <div className="login-card">
        <Logo />
        <h1>Welcome back.</h1>
        <p className="muted">Your journeys, content and conversations.</p>
        <AdminLogin firebase={firebaseMode()} />
      </div>
    </main>
  );
}
