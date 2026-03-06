import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { productApi, categoryApi } from '../../api/product.api';
import { Product, Category } from '../../types';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', price: '', mrp: '', categoryId: '', stock: '', unit: '1 pc', brand: '', images: '' };

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data: prodData, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: () => productApi.getAll({ limit: 100, search: search || undefined }),
  });
  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll() });

  const products: Product[] = prodData?.data?.data || [];
  const categories: Category[] = catData?.data?.data || [];

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', price: String(p.price), mrp: String(p.mrp), categoryId: p.categoryId, stock: String(p.stock), unit: p.unit, brand: p.brand || '', images: p.images.join(', ') });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), mrp: parseFloat(form.mrp), stock: parseInt(form.stock), images: form.images.split(',').map(s => s.trim()).filter(Boolean) };
      if (editing) {
        await productApi.update(editing.id, payload);
        toast.success('Product updated');
      } else {
        await productApi.create(payload);
        toast.success('Product created');
      }
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setShowModal(false);
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await productApi.delete(id);
    qc.invalidateQueries({ queryKey: ['admin-products'] });
    toast.success('Deleted');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Product</button>
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="flex-1 text-sm outline-none" />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['Product', 'Category', 'Price', 'MRP', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-100 p-1" />
                        <div>
                          <p className="font-medium text-gray-800 max-w-[200px] truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category?.name}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">₹{p.price}</td>
                    <td className="px-4 py-3 text-gray-400 line-through">₹{p.mrp}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stock === 0 ? 'Out of Stock' : p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {([
                { key: 'name', label: 'Name', required: true },
                { key: 'description', label: 'Description' },
                { key: 'brand', label: 'Brand' },
                { key: 'unit', label: 'Unit (e.g. 500g)', required: true },
                { key: 'images', label: 'Image URLs (comma separated)' },
              ] as const).map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{f.label}</label>
                  <input required={'required' in f ? f.required : false} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="input-field text-sm py-2" />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                {(['price', 'mrp', 'stock'] as const).map(f => (
                  <div key={f}>
                    <label className="text-xs font-medium text-gray-600 block mb-1 capitalize">{f}</label>
                    <input required type="number" min="0" value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} className="input-field text-sm py-2" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                <select required value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} className="input-field text-sm py-2">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
