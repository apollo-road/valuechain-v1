import { createActivityAction, createCostItemAction } from "@/app/server-actions";
import { ValueChainFlow } from "@/components/value-chain-flow";
import { calcAllocatedOverhead, calcProjectDirectCost } from "@/lib/accounting";
import { evaluateProject } from "@/lib/evaluate-project";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const user = await requireUser();

  const [project, allProjects, overheadPools] = await Promise.all([
    prisma.project.findFirst({
      where: { id: params.projectId, userId: user.id },
      include: { activities: { include: { costItems: true }, orderBy: { position: "asc" } } },
    }),
    prisma.project.findMany({
      where: { userId: user.id },
      include: { activities: { include: { costItems: true } } },
    }),
    prisma.overheadPool.findMany({ where: { userId: user.id } }),
  ]);

  if (!project) return <div>Project not found.</div>;

  const allocations = calcAllocatedOverhead(allProjects, overheadPools);
  const projectDirect = calcProjectDirectCost(project);
  const projectOverhead = allocations[project.id] ?? 0;
  const totalCost = projectDirect + projectOverhead;
  const projectNet = project.revenue - totalCost;
  const projectMargin = project.revenue > 0 ? (projectNet / project.revenue) * 100 : 0;

  const flowActivities = project.activities.map((activity) => {
    const direct = activity.costItems.reduce((sum, item) => sum + item.amount, 0);
    const directShare = projectDirect > 0 ? direct / projectDirect : 1 / Math.max(project.activities.length, 1);
    const overhead = projectOverhead * directShare;
    const activityRevenue = project.revenue * directShare;
    const net = activityRevenue - direct - overhead;
    return {
      id: activity.id,
      name: activity.name,
      directCost: direct,
      overhead,
      netMargin: net,
      marginPercent: activityRevenue > 0 ? (net / activityRevenue) * 100 : 0,
      laborCost: activity.costItems.filter((item) => item.type === "labor").reduce((sum, item) => sum + item.amount, 0),
    };
  });

  const suggestions = evaluateProject({
    marginPercent: projectMargin,
    activities: flowActivities.map((a) => ({ name: a.name, directCost: a.directCost, laborCost: a.laborCost })),
  });

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-slate-800 bg-panel p-4">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-4">
          <p>Total Direct Cost: ${projectDirect.toFixed(2)}</p>
          <p>Allocated Overhead: ${projectOverhead.toFixed(2)}</p>
          <p>Net Margin: ${projectNet.toFixed(2)}</p>
          <p>Margin %: {projectMargin.toFixed(1)}%</p>
        </div>
      </div>

      <ValueChainFlow activities={flowActivities} />

      <div className="grid gap-4 md:grid-cols-2">
        <form action={createActivityAction} className="space-y-3 rounded-xl border border-slate-800 bg-panel p-4">
          <h3 className="font-semibold">Add Activity</h3>
          <input type="hidden" name="projectId" value={project.id} />
          <input name="name" required placeholder="Activity name" className="w-full" />
          <button className="bg-blue-600 hover:bg-blue-500">Add</button>
        </form>

        <form action={createCostItemAction} className="space-y-3 rounded-xl border border-slate-800 bg-panel p-4">
          <h3 className="font-semibold">Add Direct Cost Item</h3>
          <input type="hidden" name="projectId" value={project.id} />
          <select name="activityId" className="w-full">
            {project.activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>
          <input name="name" required placeholder="Item name" className="w-full" />
          <input name="amount" required type="number" step="0.01" placeholder="Amount" className="w-full" />
          <select name="type" className="w-full">
            <option value="labor">Labor</option>
            <option value="material">Material</option>
            <option value="travel">Travel</option>
            <option value="tools">Tools</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-500">Add</button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-800 bg-panel p-4">
        <h3 className="font-semibold">Decision Engine Suggestions</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          {suggestions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
