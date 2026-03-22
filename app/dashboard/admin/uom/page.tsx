"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from '@/components/MessageModal';
import { getUoms, addUom, deleteUom, updateUom, Uom } from "../roles/actions";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import ButtonGuardWrapper from "@/components/ButtonGuardWrapper";
import AddUomModal from "./AddUomModal";
import EditUomModal from "./EditUomModal";
import DeleteUomModal from "./DeleteUomModal";

export default function Page() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [uoms, setUoms] = useState<Uom[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [uomToDelete, setUomToDelete] = useState<Uom | null>(null);
    const [uomToEdit, setUomToEdit] = useState<Uom | null>(null);

    useEffect(() => {
        if (!isPending && !session) {
             router.push("/");
        }
    }, [session, isPending, router]);

    const fetchUoms = useCallback(() => {
        getUoms()
            .then(setUoms)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (session) {
            fetchUoms();
        }
    }, [session, fetchUoms]);

    const handleAddUom = async (name: string, description: string) => {
        try {
            await addUom(name, description);
            await showMessage("UOM added successfully!");
            fetchUoms();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to add UOM.");
        }
    };

    const handleDeleteUom = async (id: string) => {
        try {
            await deleteUom(id);
            await showMessage("UOM deleted successfully!");
            fetchUoms();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to delete UOM.");
        }
    };

    const handleEditUom = async (id: string, name: string, description: string) => {
        try {
            await updateUom(id, name, description);
            await showMessage("UOM updated successfully!");
            fetchUoms();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to update UOM.");
        }
    };

    if (isPending || !session) {
        return <div className="p-6 text-slate-500">Loading units...</div>; 
    }

    const filteredUoms = uoms.filter(uom => 
        uom.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        uom.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <PageGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-x-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Unit Registry
        </h1>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search units..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-500/20 whitespace-nowrap"
          >
            + Add Unit
          </button>
        </ButtonGuardWrapper>
      </div>

      <AddUomModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddUom} />
      <DeleteUomModal isOpen={!!uomToDelete} onClose={() => setUomToDelete(null)} onDelete={handleDeleteUom} uom={uomToDelete} />
      <EditUomModal isOpen={!!uomToEdit} onClose={() => setUomToEdit(null)} onEdit={handleEditUom} uom={uomToEdit} />

      <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">#</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">Unit Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">Description</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-700 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredUoms.map((uom, index) => (
                <tr key={uom.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{uom.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 line-clamp-1">{uom.description}</td>
                  <td className="px-6 py-4 text-sm space-x-3 print:hidden text-center whitespace-nowrap">
                    <button
                      onClick={() => setUomToEdit(uom)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-500 hover:text-indigo-600 transition-all text-xs font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setUomToDelete(uom)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-500 hover:text-rose-600 transition-all text-xs font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredUoms.length === 0 && (
                  <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-600 italic">No measurement units found.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
    </PageGuardWrapper>
  );
}
