import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppsManager } from "@/components/admin/apps-manager";

export const dynamic = "force-dynamic";

export default async function AdminAppsPage() {
  await requireAdmin();

  const apps = await prisma.app.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return <AppsManager initialApps={apps} />;
}

