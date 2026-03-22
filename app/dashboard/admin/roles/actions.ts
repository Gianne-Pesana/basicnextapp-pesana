"use server";

import { query } from "@/lib/db";

export interface Role {
  id: string;
  description: string;
}

export async function getRoles(): Promise<Role[]> {
  const { rows } = await query<Role>('SELECT id, description FROM public.roles ORDER BY id ASC');
  return rows;
}

export async function addRole(id: string, description: string): Promise<void> {
  await query('INSERT INTO public.roles (id, description) VALUES ($1, $2)', [id, description]);
}

export async function deleteRole(id: string): Promise<void> {
  await query('DELETE FROM public.roles WHERE id = $1', [id]);
}

export async function updateRole(id: string, description: string): Promise<void> {
  await query('UPDATE public.roles SET description = $2 WHERE id = $1', [id, description]);
}

// --- UOM Actions ---
export interface Uom {
  id: string;
  name: string;
  description: string;
}

export async function getUoms(): Promise<Uom[]> {
  const { rows } = await query<Uom>('SELECT id, name, description FROM public.uom ORDER BY id ASC');
  return rows;
}

export async function addUom(name: string, description: string): Promise<void> {
  await query('INSERT INTO public.uom (name, description) VALUES ($1, $2)', [name, description]);
}

export async function updateUom(id: string, name: string, description: string): Promise<void> {
  await query('UPDATE public.uom SET name = $2, description = $3 WHERE id = $1', [id, name, description]);
}

export async function deleteUom(id: string): Promise<void> {
  await query('DELETE FROM public.uom WHERE id = $1', [id]);
}

// --- Test Categories Actions ---
export interface TestCategory {
  id: string;
  name: string;
  description: string;
}

export async function getTestCategories(): Promise<TestCategory[]> {
  const { rows } = await query<TestCategory>('SELECT id, name, description FROM public.testcategories ORDER BY id ASC');
  return rows;
}

export async function addTestCategory(name: string, description: string): Promise<void> {
  await query('INSERT INTO public.testcategories (name, description) VALUES ($1, $2)', [name, description]);
}

export async function updateTestCategory(id: string, name: string, description: string): Promise<void> {
  await query('UPDATE public.testcategories SET name = $2, description = $3 WHERE id = $1', [id, name, description]);
}

export async function deleteTestCategory(id: string): Promise<void> {
  await query('DELETE FROM public.testcategories WHERE id = $1', [id]);
}

// --- Medical Tests Actions ---
export interface MedicalTest {
  id: string;
  name: string;
  description: string;
  iduom: string;
  idcategory: string;
  uom_name?: string;
  category_name?: string;
  normalmin: number;
  normalmax: number;
}

export async function getMedicalTests(): Promise<MedicalTest[]> {
  const { rows } = await query<MedicalTest>(`
    SELECT 
      mt.id, mt.name, mt.description, mt.iduom, mt.idcategory, mt.normalmin, mt.normalmax,
      u.name as uom_name,
      tc.name as category_name
    FROM public.medicaltests mt
    LEFT JOIN public.uom u ON mt.iduom = u.id
    LEFT JOIN public.testcategories tc ON mt.idcategory = tc.id
    ORDER BY mt.id ASC
  `);
  return rows;
}

export async function addMedicalTest(data: Omit<MedicalTest, 'id' | 'uom_name' | 'category_name'>): Promise<void> {
  await query(
    'INSERT INTO public.medicaltests (name, description, iduom, idcategory, normalmin, normalmax) VALUES ($1, $2, $3, $4, $5, $6)',
    [data.name, data.description, data.iduom, data.idcategory, data.normalmin, data.normalmax]
  );
}

export async function updateMedicalTest(data: Omit<MedicalTest, 'uom_name' | 'category_name'>): Promise<void> {
  await query(
    'UPDATE public.medicaltests SET name = $2, description = $3, iduom = $4, idcategory = $5, normalmin = $6, normalmax = $7 WHERE id = $1',
    [data.id, data.name, data.description, data.iduom, data.idcategory, data.normalmin, data.normalmax]
  );
}

export async function deleteMedicalTest(id: string): Promise<void> {
  await query('DELETE FROM public.medicaltests WHERE id = $1', [id]);
}
