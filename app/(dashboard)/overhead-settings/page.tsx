import { createOverheadPoolAction } from "@/app/server-actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OverheadSettingsPage() {
  const user = await requireUser();
  const pools = await prisma.overheadPool.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <section className="space-y-5">
      <form action={createOverheadPoolAction} className="space-y-3 rounded-xl border border-slate-800 bg-panel p-4">
        <h1 className="text-xl font-semibold">Overhead Settings</h1>
        <div className="grid gap-3 md:grid-cols-3">
          <input name="name" required placeholder="Pool name" />
          <input name="monthlyCost" required type="number" step="0.01" placeholder="Monthly cost" />
          <select name="allocationBase">
            <option value="revenue">Revenue</option>
            <option value="equal">Equal</option>
          </select>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500">Create Pool</button>
      </form>

      <div className="space-y-2">
        {pools.map((pool) => (
          <div key={pool.id} className="rounded-lg border border-slate-800 bg-panel p-3 text-sm">
            {pool.name} · ${pool.monthlyCost.toFixed(2)} / month · {pool.allocationBase}
          </div>
        ))}
      </div>
    </section>
  );
}
