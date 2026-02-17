import { AllocationBase, OverheadPool } from "@prisma/client";

export type ProjectTotalsInput = {
  id: string;
  name: string;
  revenue: number;
  activities: {
    id: string;
    name: string;
    costItems: { amount: number; type: string }[];
  }[];
};

export function calcProjectDirectCost(project: ProjectTotalsInput) {
  return project.activities.reduce(
    (sum, act) => sum + act.costItems.reduce((itemSum, item) => itemSum + item.amount, 0),
    0,
  );
}

export function calcAllocatedOverhead(projects: ProjectTotalsInput[], pools: OverheadPool[]) {
  const revenueTotal = projects.reduce((sum, p) => sum + p.revenue, 0);

  return Object.fromEntries(
    projects.map((project) => {
      const projectAllocation = pools.reduce((sum, pool) => {
        if (pool.allocationBase === AllocationBase.equal) {
          return sum + pool.monthlyCost / Math.max(projects.length, 1);
        }
        return sum + (revenueTotal > 0 ? pool.monthlyCost * (project.revenue / revenueTotal) : 0);
      }, 0);

      return [project.id, projectAllocation];
    }),
  );
}
