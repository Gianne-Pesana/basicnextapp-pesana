"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from '@/components/MessageModal';
import { getTestCategories, addTestCategory, deleteTestCategory, updateTestCategory, TestCategory } from "../roles/actions";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import ButtonGuardWrapper from "@/components/ButtonGuardWrapper";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";

export default function Page() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [categories, setCategories] = useState<TestCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<TestCategory | null>(null);
    const [categoryToEdit, setCategoryToEdit] = useState<TestCategory | null>(null);

    useEffect(() => {
        if (!isPending && !session) {
             router.push("/");
        }
    }, [session, isPending, router]);

    const fetchCategories = useCallback(() => {
        getTestCategories()
            .then(setCategories)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (session) {
            fetchCategories();
        }
    }, [session, fetchCategories]);

    const handleAddCategory = async (name: string, description: string) => {
        try {
            await addTestCategory(name, description);
            await showMessage("Category added successfully!");
            fetchCategories();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to add category.");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            await deleteTestCategory(id);
            await showMessage("Category deleted successfully!");
            fetchCategories();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to delete category.");
        }
    };

    const handleEditCategory = async (id: string, name: string, description: string) => {
        try {
            await updateTestCategory(id, name, description);
            await showMessage("Category updated successfully!");
            fetchCategories();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to update category.");
        }
    };

    if (isPending || !session) {
        return <div className="p-6 text-slate-500">Loading categories...</div>; 
    }

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <PageGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-x-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Test Categories
        </h1>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search categories..."
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
            + Add Category
          </button>
        </ButtonGuardWrapper>
      </div>

      <AddCategoryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCategory} />
      <DeleteCategoryModal isOpen={!!categoryToDelete} onClose={() => setCategoryToDelete(null)} onDelete={handleDeleteCategory} category={categoryToDelete} />
      <EditCategoryModal isOpen={!!categoryToEdit} onClose={() => setCategoryToEdit(null)} onEdit={handleEditCategory} category={categoryToEdit} />

      <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">#</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">Category Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">Description</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-700 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredCategories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 line-clamp-1">{cat.description}</td>
                  <td className="px-6 py-4 text-sm space-x-3 print:hidden text-center whitespace-nowrap">
                    <button
                      onClick={() => setCategoryToEdit(cat)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-500 hover:text-indigo-600 transition-all text-xs font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(cat)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-500 hover:text-rose-600 transition-all text-xs font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredCategories.length === 0 && (
                  <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-600 italic">No categories found.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
    </PageGuardWrapper>
  );
}
