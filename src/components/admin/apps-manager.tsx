"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  ExternalLink,
  Search,
  Check,
} from "lucide-react";
import { APP_ICONS_REGISTRY, getAppIconSrc } from "@/lib/app-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export interface AdminAppItem {
  id: string;
  name: string;
  description: string | null;
  iconKey: string;
  url: string;
  active: boolean;
  displayOrder: number;
}

interface AppsManagerProps {
  initialApps: AdminAppItem[];
}

export function AppsManager({ initialApps }: AppsManagerProps) {
  const [apps, setApps] = React.useState<AdminAppItem[]>(initialApps);
  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingApp, setEditingApp] = React.useState<AdminAppItem | null>(null);
  const [deletingApp, setDeletingApp] = React.useState<AdminAppItem | null>(
    null
  );

  // Estado do formulário
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [iconKey, setIconKey] = React.useState(
    APP_ICONS_REGISTRY[0]?.key || "padrao"
  );
  const [displayOrder, setDisplayOrder] = React.useState(0);
  const [active, setActive] = React.useState(true);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const filteredApps = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return apps;
    return apps.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.url.toLowerCase().includes(term) ||
        a.iconKey.toLowerCase().includes(term)
    );
  }, [apps, search]);

  const openCreateModal = () => {
    setEditingApp(null);
    setName("");
    setDescription("");
    setUrl("https://");
    setIconKey(APP_ICONS_REGISTRY[0]?.key || "padrao");
    setDisplayOrder(apps.length + 1);
    setActive(true);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (app: AdminAppItem) => {
    setEditingApp(app);
    setName(app.name);
    setDescription(app.description || "");
    setUrl(app.url);
    setIconKey(app.iconKey);
    setDisplayOrder(app.displayOrder);
    setActive(app.active);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const endpoint = editingApp
        ? `/api/admin/apps/${editingApp.id}`
        : "/api/admin/apps";
      const method = editingApp ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          url,
          iconKey,
          displayOrder: Number(displayOrder) || 0,
          active,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível salvar o aplicativo.");
        return;
      }

      if (editingApp) {
        setApps((prev) =>
          prev
            .map((a) => (a.id === editingApp.id ? data.app : a))
            .sort((a, b) => a.displayOrder - b.displayOrder)
        );
      } else {
        setApps((prev) =>
          [...prev, data.app].sort((a, b) => a.displayOrder - b.displayOrder)
        );
      }

      setModalOpen(false);
    } catch {
      setError("Erro de conexão ao salvar aplicativo.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (app: AdminAppItem) => {
    const nextActive = !app.active;
    try {
      const response = await fetch(`/api/admin/apps/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });

      if (response.ok) {
        setApps((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, active: nextActive } : a))
        );
      }
    } catch {
      alert("Erro ao alterar status do aplicativo.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingApp) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/apps/${deletingApp.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setApps((prev) => prev.filter((a) => a.id !== deletingApp.id));
        setDeletingApp(null);
      } else {
        alert("Não foi possível excluir o aplicativo.");
      }
    } catch {
      alert("Erro ao excluir aplicativo.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Aplicativos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cadastre os aplicativos PWA, selecione seus ícones oficiais e
            gerencie os links de acesso.
          </p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          <span>Novo Aplicativo</span>
        </Button>
      </div>

      {/* Pesquisa */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar aplicativo..."
          className="pl-10 bg-white dark:bg-slate-900"
        />
      </div>

      {/* Lista de Aplicativos */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        {filteredApps.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Nenhum aplicativo encontrado.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={getAppIconSrc(app.iconKey)}
                    alt={app.name}
                    className="h-12 w-12 rounded-2xl shrink-0 shadow-xs"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {app.name}
                      </span>
                      <Badge variant={app.active ? "success" : "danger"}>
                        {app.active ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">
                         ícone: {app.iconKey}
                      </Badge>
                    </div>
                    {app.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {app.description}
                      </p>
                    )}
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400 truncate max-w-xs sm:max-w-md"
                    >
                      <span className="truncate">{app.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(app)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(app)}
                    className={
                      app.active
                        ? "text-slate-600 hover:text-amber-600 dark:text-slate-400"
                        : "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    }
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>{app.active ? "Desativar" : "Ativar"}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingApp(app)}
                    title="Excluir aplicativo"
                    aria-label={`Excluir ${app.name}`}
                    className="text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição de Aplicativo */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingApp ? "Editar Aplicativo" : "Novo Aplicativo"}
        description="Informe o nome, endereço de acesso (URL) e selecione o ícone correspondente em public/apps/icons/."
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="app-name">Nome do aplicativo</Label>
              <Input
                id="app-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Portal de Vendas"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="app-order">Ordem de exibição</Label>
              <Input
                id="app-order"
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-url">Link de acesso (URL)</Label>
            <Input
              id="app-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://meuapp.empresa.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-desc">Descrição curta (opcional)</Label>
            <Input
              id="app-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Gestão de pedidos e clientes"
            />
          </div>

          {/* Seletor visual de Ícone (public/apps/icons/<iconKey>) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Selecionar Ícone (`iconKey`)</Label>
              <span className="text-[11px] text-slate-400">
                Pasta: <code>public/apps/icons/</code>
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-2.5 dark:border-slate-800">
              {APP_ICONS_REGISTRY.map((item) => {
                const selected = iconKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIconKey(item.key)}
                    className={`relative flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all cursor-pointer ${
                      selected
                        ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600/30 dark:border-blue-500 dark:bg-blue-950/40"
                        : "border-slate-200/70 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <img
                      src={`/apps/icons/${item.filename}`}
                      alt={item.label}
                      className="h-9 w-9 rounded-xl shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                        {item.key}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {item.label}
                      </p>
                    </div>
                    {selected && (
                      <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Aplicativo ativo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apenas aplicativos ativos aparecem na tela Meus Apps dos
                usuários.
              </p>
            </div>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Aplicativo"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        open={Boolean(deletingApp)}
        onClose={() => setDeletingApp(null)}
        title="Excluir aplicativo"
        description="Esta ação removerá o aplicativo da central e revogará o acesso vinculado aos usuários."
        maxWidthClass="max-w-md"
      >
        {deletingApp && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <img
                src={getAppIconSrc(deletingApp.iconKey)}
                alt={deletingApp.name}
                className="h-10 w-10 rounded-xl"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {deletingApp.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {deletingApp.url}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tem certeza de que deseja excluir permanentemente{" "}
              <strong>{deletingApp.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingApp(null)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Confirmar Exclusão"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

