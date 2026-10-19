import { z } from "zod";
import { isValidIconKey } from "./app-icons";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const setupFirstAdminSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  profileId: z.string().min(1, "Selecione um perfil."),
  active: z.boolean().default(true),
  appIds: z.array(z.string()).default([]),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "A nova senha deve ter pelo menos 6 caracteres.",
    }),
  profileId: z.string().min(1, "Selecione um perfil."),
  active: z.boolean(),
  appIds: z.array(z.string()).default([]),
});

export const appSchema = z.object({
  name: z.string().trim().min(2, "O nome do aplicativo é obrigatório."),
  description: z.string().trim().max(160, "Máximo de 160 caracteres.").optional().or(z.literal("")),
  iconKey: z.string().refine(isValidIconKey, {
    message: "Selecione um ícone válido do registro.",
  }),
  url: z
    .string()
    .trim()
    .url("Informe um endereço (URL) válido começando com http:// ou https://"),
  active: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AppInput = z.infer<typeof appSchema>;

