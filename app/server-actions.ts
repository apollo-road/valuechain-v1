"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, logout, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  if (!email.includes("@")) return;
  await createSession(email);
  redirect("/");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}

export async function createProjectAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "");
  const revenue = Number(formData.get("revenue") || 0);
  if (!name || revenue <= 0) return;

  await prisma.project.create({
    data: {
      name,
      revenue,
      userId: user.id,
    },
  });

  revalidatePath("/");
}

export async function createActivityAction(formData: FormData) {
  await requireUser();
  const projectId = String(formData.get("projectId"));
  const name = String(formData.get("name") || "");
  if (!name) return;

  const count = await prisma.activity.count({ where: { projectId } });
  await prisma.activity.create({
    data: {
      projectId,
      name,
      position: count,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function createCostItemAction(formData: FormData) {
  await requireUser();
  const projectId = String(formData.get("projectId"));
  const activityId = String(formData.get("activityId"));
  const name = String(formData.get("name") || "");
  const amount = Number(formData.get("amount") || 0);
  const type = String(formData.get("type") || "other");
  if (!name || amount <= 0) return;

  await prisma.costItem.create({ data: { name, amount, type, activityId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function createOverheadPoolAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "");
  const monthlyCost = Number(formData.get("monthlyCost") || 0);
  const allocationBase = String(formData.get("allocationBase") || "equal") as "equal" | "revenue";

  if (!name || monthlyCost <= 0) return;

  await prisma.overheadPool.create({
    data: {
      userId: user.id,
      name,
      monthlyCost,
      allocationBase,
    },
  });

  revalidatePath("/overhead-settings");
}
