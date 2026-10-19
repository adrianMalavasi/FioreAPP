import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();

  const [users, profiles, apps] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        userApps: {
          select: { appId: true },
        },
      },
    }),
    prisma.profile.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.app.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        iconKey: true,
        active: true,
      },
    }),
  ]);

  const formattedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    profileId: u.profileId,
    profileName: u.profile.name,
    isAdmin: u.profile.isAdmin,
    active: u.active,
    createdAt: u.createdAt.toISOString(),
    appIds: u.userApps.map((ua) => ua.appId),
  }));

  return (
    <UsersManager
      currentUserId={currentUser.id}
      initialUsers={formattedUsers}
      profiles={profiles}
      apps={apps}
    />
  );
}

