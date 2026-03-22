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
      <div className="flex items-center justify-between gap-x-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
          Medical Tests Management
        </h1>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search tests..."
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold"
            onClick={() => setSearchQuery("")}
          >
            Clear
          </button>
        </div>

        <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
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

      <div className="max-h-[calc(100vh-260px)] overflow-auto rounded border bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Row #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">UOM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Range</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTests.map((test, index) => (
                <tr key={test.id} className="even:bg-gray-50/80 hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-2 text-sm">{index + 1}</td>
                  <td className="px-4 py-2 text-sm font-medium">
                    <div>{test.name}</div>
                    <div className="text-xs text-gray-400 font-normal">{test.description}</div>
                  </td>
                  <td className="px-4 py-2 text-sm">{test.uom_name || <span className="text-gray-300 italic">None</span>}</td>
                  <td className="px-4 py-2 text-sm">{test.category_name || <span className="text-gray-300 italic">None</span>}</td>
                  <td className="px-4 py-2 text-sm font-mono">{test.normalmin} - {test.normalmax}</td>
                  <td className="px-6 py-2 text-sm space-x-4 print:hidden">
                    <button
                      onClick={() => setTestToEdit(test)}
                      className="rounded bg-amber-500 px-3 py-1 text-white hover:bg-amber-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setTestToDelete(test)}
                      className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredTests.length === 0 && (
                  <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-gray-500">No medical tests found.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
    </PageGuardWrapper>
  );
}
