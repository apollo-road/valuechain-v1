import { loginAction } from "@/app/server-actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form action={loginAction} className="w-full max-w-sm space-y-4 rounded-xl border border-slate-800 bg-panel p-6">
        <h1 className="text-2xl font-semibold">EnergyMargin</h1>
        <p className="text-sm text-slate-400">Sign in with your email.</p>
        <input required name="email" type="email" placeholder="you@example.com" className="w-full" />
        <button className="w-full bg-emerald-600 font-medium hover:bg-emerald-500">Continue</button>
      </form>
    </main>
  );
}
