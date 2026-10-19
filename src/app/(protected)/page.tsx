import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppLauncherGrid } from "@/components/launcher/app-launcher-grid";

export const dynamic = "force-dynamic";

export default async function MyAppsPage() {
  const user = await requireAuth();

  // Buscar somente aplicativos ativos liberados para o usuário em user_apps
  const userApps = await prisma.userApp.findMany({
    where: {
      userId: user.id,
      app: {
        active: true,
      },
    },
    include: {
      app: true,
    },
    orderBy: [
      {
        app: {
          displayOrder: "asc",
        },
      },
      {
        app: {
          name: "asc",
        },
      },
    ],
  });

  const authorizedApps = userApps.map((ua) => ({
    id: ua.app.id,
    name: ua.app.name,
    description: ua.app.description,
    iconKey: ua.app.iconKey,
    url: ua.app.url,
  }));

  return <AppLauncherGrid userName={user.name} apps={authorizedApps} />;
}

