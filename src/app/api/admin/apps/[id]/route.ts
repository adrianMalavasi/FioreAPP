import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { appSchema } from "@/lib/validations";

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
    const parsed = appSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { name, description, iconKey, url, active, displayOrder } = parsed.data;

    const updated = await prisma.app.update({
      where: { id },
      data: {
        name,
        description: description || null,
        iconKey,
        url,
        active,
        displayOrder,
      },
    });

    return NextResponse.json({ app: updated });
  } catch (error) {
    console.error("Erro ao editar aplicativo:", error);
    return NextResponse.json(
      { error: "Erro interno ao editar aplicativo." },
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

    const updated = await prisma.app.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json({ app: updated });
  } catch (error) {
    console.error("Erro ao alterar status do aplicativo:", error);
    return NextResponse.json(
      { error: "Erro ao alterar status do aplicativo." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.isAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await prisma.app.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir aplicativo:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir aplicativo." },
      { status: 500 }
    );
  }
}

