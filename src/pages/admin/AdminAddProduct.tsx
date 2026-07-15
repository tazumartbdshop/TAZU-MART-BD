import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Loader2 } from 'lucide-react';

export default function AdminAddProduct() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Display only the actual MySQL error returned by the backend
        toast.error(data.error || 'Failed to save product');
        return;
      }

      toast.success(data.message || 'Product Saved Successfully');
      setFormData({ name: '', price: '', category: '', stock: '', description: '' });
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-sm border border-gray-100 rounded-none">
      <h2 className="text-xl font-bold mb-6">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-none" />
        <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} required className="w-full p-2 border rounded-none" />
        <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} required className="w-full p-2 border rounded-none" />
        <input name="stock" type="number" placeholder="Stock" value={formData.stock} onChange={handleChange} required className="w-full p-2 border rounded-none" />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-none" />
        <button type="submit" disabled={loading} className="bg-black text-white px-4 py-2 flex items-center gap-2 rounded-none">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}
