import { calcAllocatedOverhead, calcProjectDirectCost } from "@/lib/accounting";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MarginSummaryPage() {
  const user = await requireUser();
  const [projects, pools] = await Promise.all([
    prisma.project.findMany({ where: { userId: user.id }, include: { activities: { include: { costItems: true } } } }),
    prisma.overheadPool.findMany({ where: { userId: user.id } }),
  ]);

  const allocations = calcAllocatedOverhead(projects, pools);

  const summary = projects.map((project) => {
    const direct = calcProjectDirectCost(project);
    const overhead = allocations[project.id] ?? 0;
    const net = project.revenue - direct - overhead;
    const marginPct = project.revenue > 0 ? (net / project.revenue) * 100 : 0;
    return { id: project.id, name: project.name, revenue: project.revenue, net, marginPct };
  });

  const overallRevenue = summary.reduce((sum, p) => sum + p.revenue, 0);
  const overallNet = summary.reduce((sum, p) => sum + p.net, 0);
  const overallMargin = overallRevenue > 0 ? (overallNet / overallRevenue) * 100 : 0;
  const lowest = summary.reduce((min, p) => (p.marginPct < min.marginPct ? p : min), summary[0]);

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-panel p-4">
        <h1 className="text-xl font-semibold">Margin Summary</h1>
        <p className="mt-2 text-sm text-slate-300">Overall margin: {overallMargin.toFixed(1)}%</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-panel p-4">
        <h2 className="mb-3 font-semibold">Project Margin Chart</h2>
        <div className="space-y-3">
          {summary.map((project) => {
            const width = Math.max(5, Math.min(100, Math.abs(project.marginPct)));
            const isLowest = lowest?.id === project.id;
            return (
              <div key={project.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{project.name}</span>
                  <span className={isLowest ? "text-red-400" : "text-slate-300"}>{project.marginPct.toFixed(1)}%</span>
                </div>
                <div className="h-4 w-full rounded bg-slate-800">
                  <div
                    className={`h-4 rounded ${isLowest ? "bg-red-500" : "bg-emerald-500"}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
