"use client";

import { useState, useRef, useEffect } from "react";
import { X, GripHorizontal } from "lucide-react";
import { Uom, TestCategory, MedicalTest } from "../roles/actions";

interface AddMedicalTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<MedicalTest, 'id' | 'uom_name' | 'category_name'>) => Promise<void>;
  uoms: Uom[];
  categories: TestCategory[];
}

export default function AddMedicalTestModal({ isOpen, onClose, onAdd, uoms, categories }: AddMedicalTestModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    iduom: "",
    idcategory: "",
    normalmin: 0,
    normalmax: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentTranslate = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        iduom: uoms[0]?.id || "",
        idcategory: categories[0]?.id || "",
        normalmin: 0,
        normalmax: 0
      });
      setPosition({ x: 0, y: 0 }); 
      currentTranslate.current = { x: 0, y: 0 };
    }
  }, [isOpen, uoms, categories]);

  const onMouseDown = (e: React.MouseEvent) => {
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition({ x: currentTranslate.current.x + dx, y: currentTranslate.current.y + dy });
  };

  const onMouseUp = (e: MouseEvent) => {
      if (isDragging.current) {
          const dx = e.clientX - dragStart.current.x;
          const dy = e.clientY - dragStart.current.y;
          currentTranslate.current = { x: currentTranslate.current.x + dx, y: currentTranslate.current.y + dy };
          isDragging.current = false;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div className="bg-blue-600 px-4 py-3 border-b flex items-center justify-between cursor-move select-none" onMouseDown={onMouseDown}>
          <div className="flex items-center gap-2 text-white font-semibold">
            <GripHorizontal size={20} className="text-white/70" />
            <span>Add Medical Test</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 rounded hover:bg-blue-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-700">Test Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">UOM</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.iduom}
                onChange={(e) => setFormData({...formData, iduom: e.target.value})}
                required
              >
                {uoms.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.idcategory}
                onChange={(e) => setFormData({...formData, idcategory: e.target.value})}
                required
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Normal Min</label>
              <input
                type="number"
                step="any"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.normalmin}
                onChange={(e) => setFormData({...formData, normalmin: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Normal Max</label>
              <input
                type="number"
                step="any"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.normalmax}
                onChange={(e) => setFormData({...formData, normalmax: parseFloat(e.target.value)})}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="submit" disabled={isSubmitting || !formData.name.trim()} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? "Adding..." : "Add Test"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
