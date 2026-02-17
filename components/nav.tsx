import Link from "next/link";
import { logoutAction } from "@/app/server-actions";

export function Nav() {
  return (
    <header className="border-b border-slate-800 bg-panel">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="font-semibold">EnergyMargin</div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/">Dashboard</Link>
          <Link href="/overhead-settings">Overhead</Link>
          <Link href="/margin-summary">Summary</Link>
          <form action={logoutAction}>
            <button className="bg-slate-800 hover:bg-slate-700">Logout</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
