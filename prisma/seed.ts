import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados App Center (sem usuários)...");

  // 1. Limpar usuários existentes para que o primeiro acesso peça a criação do Admin
  await prisma.user.deleteMany();

  // 2. Perfis de acesso obrigatórios
  await prisma.profile.upsert({
    where: { name: "Administrador" },
    update: { isAdmin: true },
    create: {
      name: "Administrador",
      isAdmin: true,
    },
  });

  await prisma.profile.upsert({
    where: { name: "Usuário" },
    update: { isAdmin: false },
    create: {
      name: "Usuário",
      isAdmin: false,
    },
  });

  // 3. Aplicativos iniciais (com iconKey referenciando public/apps/icons/<iconKey>.svg)
  const initialApps = [
    {
      name: "Portal de Vendas",
      description: "Pedidos, orçamentos e acompanhamento comercial",
      iconKey: "vendas",
      url: "https://vendas.exemplo.com",
      active: true,
      displayOrder: 1,
    },
    {
      name: "Gestão Financeira",
      description: "Contas a pagar, receber e fluxo de caixa",
      iconKey: "financeiro",
      url: "https://financeiro.exemplo.com",
      active: true,
      displayOrder: 2,
    },
    {
      name: "Controle de Estoque",
      description: "Inventário, entradas e expedição de mercadorias",
      iconKey: "estoque",
      url: "https://estoque.exemplo.com",
      active: true,
      displayOrder: 3,
    },
    {
      name: "CRM Clientes",
      description: "Relacionamento e histórico de clientes",
      iconKey: "crm",
      url: "https://crm.exemplo.com",
      active: true,
      displayOrder: 4,
    },
    {
      name: "Portal RH",
      description: "Folha, férias e comunicados internos",
      iconKey: "rh",
      url: "https://rh.exemplo.com",
      active: true,
      displayOrder: 5,
    },
    {
      name: "Central de Suporte",
      description: "Abertura de chamados e atendimento técnico",
      iconKey: "suporte",
      url: "https://suporte.exemplo.com",
      active: true,
      displayOrder: 6,
    },
    {
      name: "Relatórios BI",
      description: "Painéis executivos e indicadores",
      iconKey: "relatorios",
      url: "https://relatorios.exemplo.com",
      active: true,
      displayOrder: 7,
    },
    {
      name: "Agenda Corporativa",
      description: "Compromissos, reuniões e tarefas",
      iconKey: "agenda",
      url: "https://agenda.exemplo.com",
      active: true,
      displayOrder: 8,
    },
  ];

  for (const appData of initialApps) {
    const existing = await prisma.app.findFirst({
      where: { name: appData.name },
    });

    if (existing) {
      await prisma.app.update({
        where: { id: existing.id },
        data: appData,
      });
    } else {
      await prisma.app.create({
        data: appData,
      });
    }
  }

  console.log("Seed concluído! O banco está com 0 usuários.");
  console.log("Ao abrir a tela de login, o sistema solicitará o cadastro do primeiro Administrador.");
}

main()
  .catch((e) => {
    console.error("Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
