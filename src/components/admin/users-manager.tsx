"use client";

import * as React from "react";
import {
  UserPlus,
  Pencil,
  Power,
  Search,
  CheckSquare,
  Square,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { getAppIconSrc } from "@/lib/app-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  profileId: string;
  profileName: string;
  isAdmin: boolean;
  active: boolean;
  createdAt: string;
  appIds: string[];
}

export interface ProfileOption {
  id: string;
  name: string;
  isAdmin: boolean;
}

export interface AppCheckboxOption {
  id: string;
  name: string;
  iconKey: string;
  active: boolean;
}

interface UsersManagerProps {
  currentUserId: string;
  initialUsers: AdminUserItem[];
  profiles: ProfileOption[];
  apps: AppCheckboxOption[];
}

export function UsersManager({
  currentUserId,
  initialUsers,
  profiles,
  apps,
}: UsersManagerProps) {
  const [users, setUsers] = React.useState<AdminUserItem[]>(initialUsers);
  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdminUserItem | null>(
    null
  );

  // Estado do formulário
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [profileId, setProfileId] = React.useState(profiles[0]?.id || "");
  const [active, setActive] = React.useState(true);
  const [selectedAppIds, setSelectedAppIds] = React.useState<string[]>([]);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const filteredUsers = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.profileName.toLowerCase().includes(term)
    );
  }, [users, search]);

  const openCreateModal = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    const defaultProfile =
      profiles.find((p) => !p.isAdmin) || profiles[0] || null;
    setProfileId(defaultProfile ? defaultProfile.id : "");
    setActive(true);
    setSelectedAppIds([]);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (user: AdminUserItem) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setProfileId(user.profileId);
    setActive(user.active);
    setSelectedAppIds(user.appIds);
    setError("");
    setModalOpen(true);
  };

  const toggleAppPermission = (appId: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const selectAllApps = () => {
    if (selectedAppIds.length === apps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(apps.map((a) => a.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const endpoint = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
          profileId,
          active,
          appIds: selectedAppIds,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível salvar o usuário.");
        return;
      }

      if (editingUser) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? data.user : u))
        );
      } else {
        setUsers((prev) => [data.user, ...prev]);
      }

      setModalOpen(false);
    } catch {
      setError("Erro de conexão ao salvar usuário.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: AdminUserItem) => {
    if (user.id === currentUserId && user.active) {
      alert("Você não pode desativar sua própria conta ativa.");
      return;
    }

    const nextActive = !user.active;
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, active: nextActive } : u))
        );
      }
    } catch {
      alert("Erro ao alterar status do usuário.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Tela de Usuários */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Usuários
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie contas de acesso, perfis e aplicativos liberados para cada
            usuário.
          </p>
        </div>

        <Button onClick={openCreateModal}>
          <UserPlus className="h-4 w-4" />
          <span>Novo Usuário</span>
        </Button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="pl-10 bg-white dark:bg-slate-900"
        />
      </div>

      {/* Lista de Usuários */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {user.name}
                    </span>
                    <Badge variant={user.isAdmin ? "default" : "secondary"}>
                      {user.isAdmin ? (
                        <Shield className="h-3 w-3 mr-1" />
                      ) : (
                        <UserIcon className="h-3 w-3 mr-1" />
                      )}
                      {user.profileName}
                    </Badge>
                    <Badge variant={user.active ? "success" : "danger"}>
                      {user.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user.email} •{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {user.appIds.length}{" "}
                      {user.appIds.length === 1
                        ? "aplicativo liberado"
                        : "aplicativos liberados"}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(user)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Editar / Apps</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={user.id === currentUserId}
                    onClick={() => handleToggleActive(user)}
                    title={
                      user.active ? "Desativar usuário" : "Ativar usuário"
                    }
                    className={
                      user.active
                        ? "text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                        : "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    }
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>{user.active ? "Desativar" : "Ativar"}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição de Usuário + Permissões de Aplicativos (Checkboxes) */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? "Editar Usuário" : "Novo Usuário"}
        description="Configure os dados de acesso, o perfil e marque quais aplicativos este usuário poderá acessar."
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Nome completo</Label>
              <Input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Silva"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-email">E-mail</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@empresa.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-password">
                {editingUser ? "Nova senha (opcional)" : "Senha de acesso"}
              </Label>
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  editingUser
                    ? "Deixe em branco para manter"
                    : "Mínimo 6 caracteres"
                }
                required={!editingUser}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-profile">Perfil de acesso</Label>
              <select
                id="user-profile"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus-visible:border-blue-500 focus-visible:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                required
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Usuário ativo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Usuários desativados não conseguem fazer login no App Center.
              </p>
            </div>
            <input
              type="checkbox"
              checked={active}
              disabled={editingUser?.id === currentUserId}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Lista de Aplicativos com Checkboxes */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label>Aplicativos liberados ({selectedAppIds.length})</Label>
              {apps.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllApps}
                  className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
                >
                  {selectedAppIds.length === apps.length
                    ? "Desmarcar todos"
                    : "Selecionar todos"}
                </button>
              )}
            </div>

            {apps.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500 dark:border-slate-800">
                Nenhum aplicativo cadastrado ainda.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-2.5 dark:border-slate-800">
                {apps.map((app) => {
                  const checked = selectedAppIds.includes(app.id);
                  return (
                    <label
                      key={app.id}
                      onClick={() => toggleAppPermission(app.id)}
                      className={`flex items-center gap-2.5 rounded-xl border p-2 text-left text-xs transition-colors cursor-pointer select-none ${
                        checked
                          ? "border-blue-500/60 bg-blue-50/70 text-slate-900 dark:border-blue-500/50 dark:bg-blue-950/40 dark:text-white"
                          : "border-slate-200/70 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      {checked ? (
                        <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <img
                        src={getAppIconSrc(app.iconKey)}
                        alt={app.name}
                        className="h-7 w-7 rounded-lg shrink-0"
                      />
                      <span className="font-medium truncate flex-1">
                        {app.name}
                      </span>
                      {!app.active && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400">
                          (Inativo)
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
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
              {saving ? "Salvando..." : "Salvar Usuário"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

