"use client";

import withAdminAuth from '../components/withAdminAuth';

import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import useProducts, { Product } from '../hooks/useProducts';
import Table from '../components/Table';
import ProductForm from '../components/ProductForm';
import ProductFAQs from '../components/ProductFAQs';

const ProductsPage = () => {
  const { products, loading, error } = useProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleManageFaqs = (product: Product) => {
    setSelectedProduct(product);
    setIsFaqOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'products', id));
    }
  };

  const columns = ['Order', 'Name', 'Category', 'Status', 'Actions'];

  const renderRow = (product: Product) => (
    <tr key={product.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{product.sortOrder}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.isActive ? 'Active' : 'Inactive'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={() => handleEdit(product)} className="text-indigo-400 hover:text-indigo-600">Edit</button>
        <button onClick={() => handleManageFaqs(product)} className="ml-4 text-green-400 hover:text-green-600">FAQs</button>
        <button onClick={() => handleDelete(product.id)} className="ml-4 text-red-400 hover:text-red-600">Delete</button>
      </td>
    </tr>
  );

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Gemstone Products</h1>
        <button onClick={handleAddNew} className="px-4 py-2 rounded bg-gold-500 text-black">Add New Product</button>
      </div>
      <Table columns={columns} data={products} renderRow={renderRow} />
      {isFormOpen && <ProductForm product={selectedProduct} onClose={() => setIsFormOpen(false)} />}
      {isFaqOpen && selectedProduct && <ProductFAQs productId={selectedProduct.id} />}
    </div>
  );
};

export default withAdminAuth(ProductsPage);
