/**
 * Registro oficial de ícones de aplicativos.
 *
 * Os arquivos de imagem ficam na pasta `public/apps/icons/`.
 * Cada ícone é referenciado por uma chave (`iconKey`) com o MESMO NOME do arquivo
 * (ex: `iconKey: "vendas"` -> `/apps/icons/vendas.svg`).
 *
 * Para adicionar um novo ícone:
 * 1. Coloque o arquivo na pasta `public/apps/icons/<chave>.svg` (ou `.png` / `.webp`)
 * 2. Registre a chave abaixo em `APP_ICONS_REGISTRY`.
 */

export interface AppIconDefinition {
  /** Chave única gravada no banco de dados (campo `iconKey` da tabela `apps`), com mesmo nome do arquivo */
  key: string;
  /** Nome amigável exibido no seletor do painel administrativo */
  label: string;
  /** Nome do arquivo dentro de `public/apps/icons/` */
  filename: string;
}

export const APP_ICONS_REGISTRY: readonly AppIconDefinition[] = [
  { key: "vendas", label: "Vendas / Pedidos", filename: "vendas.svg" },
  { key: "financeiro", label: "Financeiro / Contas", filename: "financeiro.svg" },
  { key: "estoque", label: "Estoque / Logística", filename: "estoque.svg" },
  { key: "crm", label: "CRM / Clientes", filename: "crm.svg" },
  { key: "rh", label: "RH / Equipe", filename: "rh.svg" },
  { key: "suporte", label: "Suporte / Atendimento", filename: "suporte.svg" },
  { key: "relatorios", label: "Relatórios / BI", filename: "relatorios.svg" },
  { key: "agenda", label: "Agenda / Tarefas", filename: "agenda.svg" },
  { key: "padrao", label: "Aplicativo Geral", filename: "padrao.svg" },
] as const;

export const VALID_ICON_KEYS: string[] = APP_ICONS_REGISTRY.map((item) => item.key);

export function isValidIconKey(key: string): boolean {
  return VALID_ICON_KEYS.includes(key);
}

/**
 * Retorna a URL pública da imagem do ícone em `/apps/icons/<filename>` a partir da `iconKey`.
 */
export function getAppIconSrc(iconKey: string): string {
  const found = APP_ICONS_REGISTRY.find((item) => item.key === iconKey);
  if (found) {
    return `/apps/icons/${found.filename}`;
  }
  return "/apps/icons/padrao.svg";
}

