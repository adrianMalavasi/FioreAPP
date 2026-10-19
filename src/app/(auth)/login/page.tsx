"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PwaRegisterAndInstall } from "@/components/layout/pwa-install-banner";

export default function LoginPage() {
  const router = useRouter();
  const [checkingSetup, setCheckingSetup] = React.useState(true);
  const [needsSetup, setNeedsSetup] = React.useState(false);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    fetch("/api/auth/setup")
      .then((res) => res.json())
      .then((data) => {
        if (active && typeof data.needsSetup === "boolean") {
          setNeedsSetup(data.needsSetup);
        }
      })
      .catch(() => {
        // Em caso de falha na checagem, exibe o login padrão
      })
      .finally(() => {
        if (active) setCheckingSetup(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = needsSetup ? "/api/auth/setup" : "/api/auth/login";
      const payload = needsSetup
        ? { name, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            (needsSetup
              ? "Não foi possível criar o administrador."
              : "Falha ao entrar. Verifique suas credenciais.")
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950">
      <header className="flex items-center justify-end gap-2 p-4 sm:px-8">
        <PwaRegisterAndInstall />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-sm">
          {/* Identidade Visual App Center */}
          <div className="flex flex-col items-center text-center mb-8">
            <img
              src="/icons/icon-192x192.png"
              alt="Logo App Center"
              className="h-16 w-16 rounded-[20px] shadow-md mb-4"
            />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              App Center
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {checkingSetup
                ? "Verificando ambiente..."
                : needsSetup
                ? "Bem-vindo! Crie o primeiro usuário Administrador"
                : "Entre para acessar seus aplicativos"}
            </p>
          </div>

          {/* Card de Login ou Primeiro Acesso (Admin) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            {checkingSetup ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Carregando...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {needsSetup && (
                  <div className="flex items-start gap-2.5 rounded-2xl border border-blue-200/80 bg-blue-50/70 p-3 text-xs text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300">
                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      Nenhum usuário encontrado. Cadastre abaixo a conta{" "}
                      <strong>Administrador</strong> principal do sistema.
                    </span>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
                  >
                    {error}
                  </div>
                )}

                {needsSetup && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Seu nome</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Nome do Administrador"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">
                    {needsSetup ? "Crie uma senha (mín. 6 caracteres)" : "Senha"}
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete={
                        needsSetup ? "new-password" : "current-password"
                      }
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full mt-2"
                >
                  <span>
                    {loading
                      ? needsSetup
                        ? "Criando Administrador..."
                        : "Entrando..."
                      : needsSetup
                      ? "Criar Administrador e Entrar"
                      : "Entrar"}
                  </span>
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
