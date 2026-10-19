import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.isAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { name, email, password, profileId, active, appIds } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    // Evitar que o próprio administrador logado desative a si mesmo acidentalmente
    if (id === currentUser.id && !active) {
      return NextResponse.json(
        { error: "Você não pode desativar sua própria conta ativa." },
        { status: 400 }
      );
    }

    const emailConflict = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        NOT: { id },
      },
    });

    if (emailConflict) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso por outro usuário." },
        { status: 409 }
      );
    }

    const updateData: {
      name: string;
      email: string;
      profileId: string;
      active: boolean;
      passwordHash?: string;
    } = {
      name,
      email: normalizedEmail,
      profileId,
      active,
    };

    if (password && password.trim().length > 0) {
      updateData.passwordHash = await hashPassword(password);
    }

    const uniqueAppIds = Array.from(new Set(appIds));

    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: updateData,
        include: { profile: true },
      });

      await tx.userApp.deleteMany({
        where: { userId: id },
      });

      if (uniqueAppIds.length > 0) {
        await tx.userApp.createMany({
          data: uniqueAppIds.map((appId) => ({
            userId: id,
            appId,
          })),
        });
      }

      return user;
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        profileId: updated.profileId,
        profileName: updated.profile.name,
        isAdmin: updated.profile.isAdmin,
        active: updated.active,
        createdAt: updated.createdAt,
        appIds: uniqueAppIds,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar usuário." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.isAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const active = Boolean(body.active);

    if (id === currentUser.id && !active) {
      return NextResponse.json(
        { error: "Você não pode desativar sua própria conta." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json({ id: updated.id, active: updated.active });
  } catch (error) {
    console.error("Erro ao alterar status do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao alterar status do usuário." },
      { status: 500 }
    );
  }
}

