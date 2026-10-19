import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  APP_ICONS_REGISTRY,
  getAppIconSrc,
  isValidIconKey,
} from "@/lib/app-icons";
import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  appSchema,
} from "@/lib/validations";
import { signSessionToken, verifySessionToken } from "@/lib/jwt";

describe("App Center PWA — Testes dos Fluxos Principais", () => {
  describe("1. Registro de Ícones (public/apps/icons/<iconKey>)", () => {
    it("deve possuir todos os arquivos de ícone físicos na pasta public/apps/icons/ com o mesmo nome da chave", () => {
      for (const icon of APP_ICONS_REGISTRY) {
        expect(icon.filename.startsWith(icon.key)).toBe(true);
        const filePath = path.join(
          process.cwd(),
          "public",
          "apps",
          "icons",
          icon.filename
        );
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });

    it("deve validar corretamente chaves de ícones existentes e rejeitar chaves inválidas", () => {
      expect(isValidIconKey("vendas")).toBe(true);
      expect(isValidIconKey("financeiro")).toBe(true);
      expect(isValidIconKey("inexistente-xyz")).toBe(false);
    });

    it("deve resolver o caminho público do ícone a partir da chave ou retornar o ícone padrão", () => {
      expect(getAppIconSrc("vendas")).toBe("/apps/icons/vendas.svg");
      expect(getAppIconSrc("chave-desconhecida")).toBe("/apps/icons/padrao.svg");
    });
  });

  describe("2. Validação de Formulários e Regras de Negócio (Zod)", () => {
    it("deve validar credenciais de login corretamente", () => {
      expect(
        loginSchema.safeParse({
          email: "admin@appcenter.com",
          password: "admin123",
        }).success
      ).toBe(true);

      expect(
        loginSchema.safeParse({
          email: "email-invalido",
          password: "",
        }).success
      ).toBe(false);
    });

    it("deve validar criação e atualização de usuário com lista de aplicativos (user_apps)", () => {
      const validUser = createUserSchema.safeParse({
        name: "João Silva",
        email: "joao@empresa.com",
        password: "senha123",
        profileId: "profile_user",
        active: true,
        appIds: ["app_1", "app_2"],
      });
      expect(validUser.success).toBe(true);

      const updateWithoutPassword = updateUserSchema.safeParse({
        name: "João Silva Editado",
        email: "joao@empresa.com",
        password: "",
        profileId: "profile_user",
        active: false,
        appIds: ["app_1"],
      });
      expect(updateWithoutPassword.success).toBe(true);
    });

    it("deve permitir apenas ícones registrados e URLs válidas no cadastro de aplicativos", () => {
      const validApp = appSchema.safeParse({
        name: "Portal de Vendas",
        description: "Sistema de vendas",
        iconKey: "vendas",
        url: "https://vendas.empresa.com",
        active: true,
        displayOrder: 1,
      });
      expect(validApp.success).toBe(true);

      const invalidIconApp = appSchema.safeParse({
        name: "App Inválido",
        iconKey: "icone_nao_registrado",
        url: "https://app.empresa.com",
        active: true,
      });
      expect(invalidIconApp.success).toBe(false);
    });
  });

  describe("3. Autenticação e Sessão JWT", () => {
    it("deve assinar e verificar um token JWT válido preservando permissões de perfil", async () => {
      const payload = {
        userId: "usr_123",
        name: "Administrador",
        email: "admin@appcenter.com",
        isAdmin: true,
      };

      const token = await signSessionToken(payload);
      const verified = await verifySessionToken(token);

      expect(verified).toEqual(payload);
    });

    it("deve rejeitar um token JWT adulterado ou inválido", async () => {
      const verified = await verifySessionToken("token.invalido.adulterado");
      expect(verified).toBeNull();
    });
  });
});

