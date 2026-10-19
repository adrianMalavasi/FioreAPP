import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { appSchema } from "@/lib/validations";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.isAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const apps = await prisma.app.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: { userApps: true },
      },
    },
  });

  return NextResponse.json({ apps });
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.isAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = appSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { name, description, iconKey, url, active, displayOrder } = parsed.data;

    const app = await prisma.app.create({
      data: {
        name,
        description: description || null,
        iconKey,
        url,
        active,
        displayOrder,
      },
    });

    // Vincular automaticamente ao administrador criador para fácil visualização
    await prisma.userApp.upsert({
      where: {
        userId_appId: {
          userId: currentUser.id,
          appId: app.id,
        },
      },
      update: {},
      create: {
        userId: currentUser.id,
        appId: app.id,
      },
    });

    return NextResponse.json({ app }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar aplicativo:", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar aplicativo." },
      { status: 500 }
    );
  }
}

