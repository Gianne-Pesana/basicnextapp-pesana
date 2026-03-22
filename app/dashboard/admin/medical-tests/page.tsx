"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from '@/components/MessageModal';
import { getMedicalTests, addMedicalTest, deleteMedicalTest, updateMedicalTest, getUoms, getTestCategories, MedicalTest, Uom, TestCategory } from "../roles/actions";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import ButtonGuardWrapper from "@/components/ButtonGuardWrapper";
import AddMedicalTestModal from "./AddMedicalTestModal";
import EditMedicalTestModal from "./EditMedicalTestModal";
import DeleteMedicalTestModal from "./DeleteMedicalTestModal";

export default function Page() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [tests, setTests] = useState<MedicalTest[]>([]);
    const [uoms, setUoms] = useState<Uom[]>([]);
    const [categories, setCategories] = useState<TestCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [testToDelete, setTestToDelete] = useState<MedicalTest | null>(null);
    const [testToEdit, setTestToEdit] = useState<MedicalTest | null>(null);

    useEffect(() => {
        if (!isPending && !session) {
             router.push("/");
        }
    }, [session, isPending, router]);

    const fetchData = useCallback(async () => {
        try {
            const [testsData, uomsData, catsData] = await Promise.all([
                getMedicalTests(),
                getUoms(),
                getTestCategories()
            ]);
            setTests(testsData);
            setUoms(uomsData);
            setCategories(catsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session, fetchData]);

    const handleAddTest = async (data: Omit<MedicalTest, 'id' | 'uom_name' | 'category_name'>) => {
        try {
            await addMedicalTest(data);
            await showMessage("Medical Test added successfully!");
            fetchData();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to add medical test.");
        }
    };

    const handleDeleteTest = async (id: string) => {
        try {
            await deleteMedicalTest(id);
            await showMessage("Medical Test deleted successfully!");
            fetchData();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to delete medical test.");
        }
    };

    const handleEditTest = async (data: Omit<MedicalTest, 'uom_name' | 'category_name'>) => {
        try {
            await updateMedicalTest(data);
            await showMessage("Medical Test updated successfully!");
            fetchData();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to update medical test.");
        }
    };

    if (isPending || !session) {
        return <div className="p-6">Loading...</div>; 
    }

    const filteredTests = tests.filter(test => 
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.uom_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <PageGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-x-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Medical Tests
        </h1>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search tests..."
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
            + Add Test
          </button>
        </ButtonGuardWrapper>
      </div>

      <AddMedicalTestModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddTest}
        uoms={uoms}
        categories={categories}
      />

      <DeleteMedicalTestModal
        isOpen={!!testToDelete}
        onClose={() => setTestToDelete(null)}
        onDelete={handleDeleteTest}
        test={testToDelete}
      />

      <EditMedicalTestModal
        isOpen={!!testToEdit}
        onClose={() => setTestToEdit(null)}
        onEdit={handleEditTest}
        test={testToEdit}
        uoms={uoms}
        categories={categories}
      />

      <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">#</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">UOM</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">Range</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-700 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredTests.map((test, index) => (
                <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{test.name}</div>
                    <div className="text-xs text-slate-600 line-clamp-1">{test.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {test.uom_name || <span className="text-slate-400 italic text-xs">None</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {test.category_name || <span className="text-slate-400 italic text-xs">None</span>}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-indigo-600 font-bold tracking-tighter">
                    {test.normalmin} – {test.normalmax}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-3 print:hidden text-center whitespace-nowrap">
                    <button
                      onClick={() => setTestToEdit(test)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-500 hover:text-indigo-600 transition-all text-xs font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setTestToDelete(test)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-500 hover:text-rose-600 transition-all text-xs font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredTests.length === 0 && (
                  <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-600 italic">No medical tests found matching your criteria.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
    </PageGuardWrapper>
  );
}
