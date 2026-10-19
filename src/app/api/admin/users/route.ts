import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { createUserSchema } from "@/lib/validations";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.isAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

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
    createdAt: u.createdAt,
    appIds: u.userApps.map((ua) => ua.appId),
  }));

  return NextResponse.json({
    users: formattedUsers,
    profiles,
    apps,
  });
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.isAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { name, email, password, profileId, active, appIds } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe um usuário cadastrado com este e-mail." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const uniqueAppIds = Array.from(new Set(appIds));

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          profileId,
          active,
        },
        include: { profile: true },
      });

      if (uniqueAppIds.length > 0) {
        await tx.userApp.createMany({
          data: uniqueAppIds.map((appId) => ({
            userId: user.id,
            appId,
          })),
        });
      }

      return user;
    });

    return NextResponse.json(
      {
        user: {
          id: created.id,
          name: created.name,
          email: created.email,
          profileId: created.profileId,
          profileName: created.profile.name,
          isAdmin: created.profile.isAdmin,
          active: created.active,
          createdAt: created.createdAt,
          appIds: uniqueAppIds,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar usuário." },
      { status: 500 }
    );
  }
}

