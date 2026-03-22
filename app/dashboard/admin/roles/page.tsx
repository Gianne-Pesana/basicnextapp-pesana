"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from '@/components/MessageModal';
import { getRoles, addRole, deleteRole, updateRole, Role } from "./actions";
import { downloadRolesExcel } from "./DownloadRoles";
import DownloadRolesPdf from "./DownloadRolesPdf";
import AddRoleModal from "./AddRoleModal";
import DeleteRoleModal from "./DeleteRoleModal";
import EditRoleModal from "./EditRoleModal";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import ButtonGuardWrapper from "@/components/ButtonGuardWrapper";
import ConfirmModal from "@/components/ConfirmModal";

export default function Page() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

    useEffect(() => {
        if (!isPending && !session) {
             router.push("/");
        }
    }, [session, isPending, router]);

    const fetchRoles = useCallback(() => {
        getRoles()
            .then(setRoles)
            .catch(console.error)
            .finally(() => setLoadingRoles(false));
    }, []);

    useEffect(() => {
        if (session) {
            fetchRoles();
        }
    }, [session, fetchRoles]);

    const handleAddRole = async (id: string, description: string) => {
        try {
            await addRole(id, description);
            await showMessage("Role added successfully!");
            fetchRoles();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to add role.");
        }
    };

    const handleDeleteRole = async (id: string) => {
        try {
            await deleteRole(id);
            await showMessage("Role deleted successfully!");
            fetchRoles();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to delete role.");
        }
    };

    const handleEditRole = async (id: string, description: string) => {
        try {
            await updateRole(id, description);
            await showMessage("Role updated successfully!");
            fetchRoles();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to update role.");
        }
    };

    const handleDownloadExcel = async () => {
        const confirmed = await ConfirmModal("Download Roles to Excel?", {
            okText: "Yes, Download",
            cancelText: "Cancel",
            okColor: "bg-emerald-600 hover:bg-emerald-700",
        });
        if (!confirmed) return;
        const filtered = roles.filter(role => 
            role.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
            role.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        downloadRolesExcel(filtered);
    };

    if (isPending || !session) {
        return <div className="p-6 text-slate-500">Loading roles...</div>; 
    }

    const filteredRoles = roles.filter(role => 
        role.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <PageGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANACCESSROLES"]}>
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-x-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
          Role Management
        </h1>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search roles..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
            <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "USERS_CANDOWNLOADROLES"]}>
                <button
                    onClick={handleDownloadExcel}
                    className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-sm whitespace-nowrap"
                >
                    Download Excel
                </button>
            </ButtonGuardWrapper>
            <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "USERS_CANPRINTROLES"]}>
                <DownloadRolesPdf roles={filteredRoles} searchQuery={searchQuery} />
            </ButtonGuardWrapper>
        </div>

        <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANADDROLES"]}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm whitespace-nowrap"
          >
            + Add Role
          </button>
        </ButtonGuardWrapper>
      </div>

      <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANADDROLES"]}>
        <AddRoleModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddRole} 
        />
      </ButtonGuardWrapper>

      <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANDELETEROLES"]}>
        <DeleteRoleModal
          isOpen={!!roleToDelete}
          onClose={() => setRoleToDelete(null)}
          onDelete={handleDeleteRole}
          role={roleToDelete}
        />
      </ButtonGuardWrapper>

      <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANEDITROLES"]}>
        <EditRoleModal
          isOpen={!!roleToEdit}
          onClose={() => setRoleToEdit(null)}
          onEdit={handleEditRole}
          role={roleToEdit}
        />
      </ButtonGuardWrapper>

      {/* Table */}
      <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">#</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">Role ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">Description</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-700 print:hidden">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {filteredRoles.map((role, index) => (
                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 tracking-wide">{role.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 leading-relaxed">{role.description}</td>
                  <td className="px-6 py-4 text-sm space-x-3 print:hidden text-center whitespace-nowrap">
                    <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANEDITROLES"]}>
                      <button
                        onClick={() => setRoleToEdit(role)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-amber-500 hover:text-amber-600 transition-all text-xs font-bold"
                      >
                        Edit
                      </button>
                    </ButtonGuardWrapper>

                    <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANDELETEROLES"]}>
                      <button
                        onClick={() => setRoleToDelete(role)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-500 hover:text-rose-600 transition-all text-xs font-bold"
                      >
                        Delete
                      </button>
                    </ButtonGuardWrapper>
                  </td>
                </tr>
              ))}
              {!loadingRoles && filteredRoles.length === 0 && (
                  <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No system roles discovered matching your search.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-2 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
          Registry Count: {filteredRoles.length} of {roles.length} roles
        </div>
    </div>
    </PageGuardWrapper>
  );
}
