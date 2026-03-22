"use client";

import { X, AlertTriangle } from "lucide-react";
import { MedicalTest } from "../roles/actions";

interface DeleteMedicalTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  test: MedicalTest | null;
}

export default function DeleteMedicalTestModal({ isOpen, onClose, onDelete, test }: DeleteMedicalTestModalProps) {
  if (!isOpen || !test) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-sm bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-red-600 px-4 py-3 text-white flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle size={20} />
            <span>Confirm Delete</span>
          </div>
          <button onClick={onClose} className="hover:bg-red-700 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete the medical test <span className="font-bold text-red-600">"{test.name}"</span>?
            <br />
            <span className="text-sm text-gray-500">This action cannot be undone.</span>
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => onDelete(test.id)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Yes, Delete
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
