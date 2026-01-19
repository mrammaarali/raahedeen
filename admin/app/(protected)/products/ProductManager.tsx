"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb, getFirebaseStorage } from '../../firebase';
import ProductFaqManager from './ProductFaqManager';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  whatsappTemplate: string;
  imageUrls: string[];
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', category: '', description: '', isActive: true, sortOrder: 0, whatsappTemplate: 'I want to buy {productName} – ID {productId}', imageUrls: [] as string[] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const fetchProducts = async () => {
    setLoading(true);
    const db = getFirebaseDb();
    const productsCollection = collection(db, 'gemstone_products');
    const q = query(productsCollection, orderBy('sortOrder'));
    const snapshot = await getDocs(q);
    const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    setProducts(productList);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getFirebaseDb();
    if (editingId) {
      const productDoc = doc(db, 'gemstone_products', editingId);
      await updateDoc(productDoc, form);
      setEditingId(null);
    } else {
      const productsCollection = collection(db, 'gemstone_products');
      await addDoc(productsCollection, form);
    }
    setForm({ name: '', category: '', description: '', isActive: true, sortOrder: 0, whatsappTemplate: 'I want to buy {productName} – ID {productId}', imageUrls: [] });
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm(product);
  };

  const handleDelete = async (id: string) => {
    const db = getFirebaseDb();
    const productDoc = doc(db, 'gemstone_products', id);
    await deleteDoc(productDoc);
    fetchProducts();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', category: '', description: '', isActive: true, sortOrder: 0, whatsappTemplate: 'I want to buy {productName} – ID {productId}', imageUrls: [] });
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newImageUrls = [...form.imageUrls];
    const storage = getFirebaseStorage();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        },
        (error) => {
          console.error("Upload failed:", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          newImageUrls.push(downloadURL);
          if (i === files.length - 1) {
            setForm(prev => ({ ...prev, imageUrls: newImageUrls }));
            setUploading(false);
            setUploadProgress({});
          }
        }
      );
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    const storage = getFirebaseStorage();
    const imageRef = ref(storage, imageUrl);
    try {
      await deleteObject(imageRef);
      setForm(prev => ({ ...prev, imageUrls: prev.imageUrls.filter(url => url !== imageUrl) }));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-navy-800 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gold-500 mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" required />
          <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" />
          <textarea placeholder="Description / Specs" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700 h-24" />
          <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" />
          <textarea placeholder="WhatsApp Template" value={form.whatsappTemplate} onChange={(e) => setForm({ ...form, whatsappTemplate: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <label htmlFor="isActive">Is Active?</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Images (up to 6)</label>
            <input type="file" multiple onChange={handleImageUpload} accept="image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gold-500 file:text-black hover:file:bg-gold-600" disabled={uploading || form.imageUrls.length >= 6} />
            {uploading && <div className="mt-2 text-sm text-gray-400">{Object.entries(uploadProgress).map(([name, progress]) => <div key={name}>{name}: {progress.toFixed(2)}%</div>)}</div>}
            <div className="mt-4 flex flex-wrap gap-4">
              {form.imageUrls.map(url => (
                <div key={url} className="relative w-24 h-24">
                  <img src={url} alt="Product image" className="w-full h-full object-cover rounded" />
                  <button type="button" onClick={() => handleImageDelete(url)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button type="submit" className="px-4 py-2 rounded bg-gold-500 text-black font-medium" disabled={uploading}>{editingId ? 'Update Product' : 'Add Product'}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="px-4 py-2 rounded bg-gray-600 text-white">Cancel</button>}
          </div>
        </form>

        {editingId && <ProductFaqManager productId={editingId} />}
      </div>

      <div className="bg-navy-800 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gold-500 mb-4">Existing Products</h2>
        {loading ? <p>Loading products...</p> : (
          <div className="space-y-3">
            {products.map(product => (
              <div key={product.id} className="flex justify-between items-center bg-navy-900 p-3 rounded">
                <div>
                  <p className="font-semibold">{product.sortOrder}. {product.name} ({product.category})</p>
                  <p className={`text-sm ${product.isActive ? 'text-green-400' : 'text-red-400'}`}>{product.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(product)} className="text-sm text-blue-400">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="text-sm text-red-400">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
