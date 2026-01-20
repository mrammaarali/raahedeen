"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseDb } from '../firebase';
import ProductForm from './ProductForm';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  imageUrls?: string[];
  whatsappTemplate?: string;
}

const db = getFirebaseDb();
const storage = getStorage();

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('sortOrder'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsFormVisible(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  const handleSave = async (productData: Omit<Product, 'id'>, files?: FileList) => {
    setLoading(true);
    let imageUrls = productData.imageUrls || [];

    try {
      if (files && files.length > 0) {
        const uploadPromises = Array.from(files).map(async (file) => {
          const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          return getDownloadURL(fileRef);
        });
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const dataToSave = { ...productData, imageUrls };

      if (selectedProduct) {
        await updateDoc(doc(db, 'products', selectedProduct.id), dataToSave);
      } else {
        await addDoc(collection(db, 'products'), dataToSave);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Check console for details.');
    } finally {
      setLoading(false);
      setIsFormVisible(false);
      setSelectedProduct(null);
    }
  };

  if (loading && products.length === 0) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {isFormVisible && (
        <ProductForm
          product={selectedProduct}
          onSave={handleSave}
          onCancel={() => {
            setIsFormVisible(false);
            setSelectedProduct(null);
          }}
        />
      )}
      <div className="px-6 py-4">
        <button onClick={handleAddNew} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
          Add New Product
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">{product.sortOrder}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
