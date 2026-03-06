import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { categoryApi } from '../../api/product.api';
import { Category } from '../../types';
import toast from 'react-hot-toast';

const EMPTY = { name: '', color: '', image: '', displayOrder: '0' };

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll() });
  const categories: Category[] = data?.data?.data || [];

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, color: c.color || '', image: c.image || '', displayOrder: String(c.displayOrder) });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, displayOrder: parseInt(form.displayOrder) };
      if (editing) { await categoryApi.update(editing.id, payload); toast.success('Updated'); }
      else { await categoryApi.create(payload); toast.success('Created'); }
      qc.invalidateQueries({ queryKey: ['categories'] });
      setShowModal(false);
      setEditing(null);
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete category?')) return;
    await categoryApi.delete(id);
    qc.invalidateQueries({ queryKey: ['categories'] });
    toast.success('Deleted');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={() => { setEditing(null); setForm(EMPTY); setShowModal(true); }} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Category</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <div key={i} className="card p-4 animate-pulse h-32" />)
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="card p-4 flex flex-col items-center text-center relative group">
              {cat.image && <img src={cat.image} alt={cat.name} className="w-12 h-12 object-contain mb-2" />}
              <div className="w-3 h-3 rounded-full mb-2" style={{ background: cat.color || '#ccc' }} />
              <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
              <p className="text-xs text-gray-400">{cat._count?.products ?? 0} products</p>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-1 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={13} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { key: 'name', label: 'Name', required: true },
                { key: 'image', label: 'Image URL' },
                { key: 'color', label: 'Color (hex, e.g. #4ade80)' },
                { key: 'displayOrder', label: 'Display Order', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{f.label}</label>
                  <input required={'required' in f && f.required} type={f.type || 'text'}
                    value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="input-field text-sm py-2" />
                </div>
              ))}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
