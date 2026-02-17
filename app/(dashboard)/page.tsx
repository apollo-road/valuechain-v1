import Link from "next/link";
import { createProjectAction } from "@/app/server-actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { activities: { include: { costItems: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-panel p-4">
        <h2 className="mb-3 text-lg font-semibold">Create Project</h2>
        <form action={createProjectAction} className="grid gap-3 md:grid-cols-3">
          <input name="name" placeholder="Project name" required />
          <input name="revenue" placeholder="Revenue" type="number" step="0.01" required />
          <button className="bg-blue-600 hover:bg-blue-500">Create</button>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Projects</h2>
        {projects.map((project) => {
          const directCost = project.activities.reduce(
            (sum, activity) => sum + activity.costItems.reduce((sub, item) => sub + item.amount, 0),
            0,
          );

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-xl border border-slate-800 bg-panel p-4 hover:border-slate-600"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{project.name}</h3>
                <span className="text-sm text-slate-400">Revenue ${project.revenue.toFixed(0)}</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">Direct cost ${directCost.toFixed(0)}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
