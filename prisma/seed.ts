import { PrismaClient, AllocationBase } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "freelancer@energymargin.dev";

  await prisma.costItem.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.project.deleteMany();
  await prisma.overheadPool.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      name: "Demo Freelancer",
      projects: {
        create: [
          { name: "Solar Site Audit", revenue: 14000 },
          { name: "Battery Retrofit", revenue: 22000 },
          { name: "Energy Model Automation", revenue: 17500 },
        ],
      },
      overheadPools: {
        create: [
          { name: "Software", monthlyCost: 900, allocationBase: AllocationBase.revenue },
          { name: "Admin", monthlyCost: 1200, allocationBase: AllocationBase.equal },
        ],
      },
    },
    include: { projects: true },
  });

  const activityTemplates = [
    "Discovery",
    "Data Collection",
    "Analysis",
    "Documentation",
    "Client Review",
  ];

  const baseCosts = [2200, 3000, 2700, 1400, 1100];

  for (const project of user.projects) {
    for (let i = 0; i < activityTemplates.length; i++) {
      const activity = await prisma.activity.create({
        data: {
          name: activityTemplates[i],
          position: i,
          projectId: project.id,
        },
      });

      await prisma.costItem.createMany({
        data: [
          {
            activityId: activity.id,
            name: "Labor",
            amount: baseCosts[i] + (Math.random() * 400 - 200),
            type: "labor",
          },
          {
            activityId: activity.id,
            name: "Tools",
            amount: 400 + i * 75,
            type: "tools",
          },
          {
            activityId: activity.id,
            name: "Travel",
            amount: 200 + i * 50,
            type: "travel",
          },
        ],
      });
    }
  }

  console.log("Seeded demo freelancer with 3 projects and 5 activities each.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
