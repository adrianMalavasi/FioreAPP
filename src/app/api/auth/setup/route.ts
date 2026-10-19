import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { setupFirstAdminSchema } from "@/lib/validations";

/**
 * Verifica se o sistema ainda não possui nenhum usuário cadastrado.
 */
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ needsSetup: userCount === 0 });
  } catch (error) {
    console.error("Erro ao verificar setup inicial:", error);
    return NextResponse.json(
      { error: "Erro ao verificar banco de dados." },
      { status: 500 }
    );
  }
}

/**
 * Cria o primeiro usuário do sistema obrigatoriamente como Administrador.
 * Só é permitido executar quando a tabela `users` está vazia (0 usuários).
 */
export async function POST(request: NextRequest) {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        { error: "O primeiro administrador já foi cadastrado." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = setupFirstAdminSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    const passwordHash = await hashPassword(password);

    const adminUser = await prisma.$transaction(async (tx) => {
      // Garantir que os dois perfis básicos existam no banco
      const adminProfile = await tx.profile.upsert({
        where: { name: "Administrador" },
        update: { isAdmin: true },
        create: { name: "Administrador", isAdmin: true },
      });

      await tx.profile.upsert({
        where: { name: "Usuário" },
        update: { isAdmin: false },
        create: { name: "Usuário", isAdmin: false },
      });

      // Criar o primeiro usuário como Administrador
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          profileId: adminProfile.id,
          active: true,
        },
        include: { profile: true },
      });

      // Vincular aplicativos já existentes (se houver) ao primeiro administrador
      const existingApps = await tx.app.findMany({ select: { id: true } });
      if (existingApps.length > 0) {
        await tx.userApp.createMany({
          data: existingApps.map((app) => ({
            userId: user.id,
            appId: app.id,
          })),
        });
      }

      return user;
    });

    await setSessionCookie({
      userId: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      isAdmin: true,
    });

    return NextResponse.json(
      {
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          isAdmin: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar primeiro administrador:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar o primeiro administrador." },
      { status: 500 }
    );
  }
}

