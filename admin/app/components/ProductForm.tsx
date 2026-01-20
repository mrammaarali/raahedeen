"use client";

import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { Product } from '../hooks/useProducts';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({ 
        name: '', 
        category: '', 
        description: '', 
        images: Array(6).fill(''), 
        isActive: true, 
        whatsappMessage: '', 
        sortOrder: 0 
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...(formData.images || [])];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getFirebaseDb();
    const id = product?.id || doc(collection(db, 'products')).id;
    const docRef = doc(db, 'products', id);
    await setDoc(docRef, { ...formData, id, createdAt: serverTimestamp() }, { merge: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{product ? 'Edit' : 'Add'} Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" className="w-full p-2 rounded bg-gray-700" />
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="w-full p-2 rounded bg-gray-700" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 rounded bg-gray-700 h-32"></textarea>
          <textarea name="whatsappMessage" value={formData.whatsappMessage} onChange={handleChange} placeholder="WhatsApp Message Template" className="w-full p-2 rounded bg-gray-700"></textarea>
          <input name="sortOrder" type="number" value={formData.sortOrder} onChange={handleChange} placeholder="Sort Order" className="w-full p-2 rounded bg-gray-700" />
          <label className="flex items-center space-x-2"><input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} /><span>Active</span></label>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Images (up to 6 URLs)</h3>
            {(formData.images || []).map((url, index) => (
              <input key={index} value={url} onChange={(e) => handleImageChange(index, e.target.value)} placeholder={`Image URL ${index + 1}`} className="w-full p-2 rounded bg-gray-700" />
            ))}
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-600">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-gold-500 text-black">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
