"use client";

import { useState, useEffect } from 'react';

interface Product {
  id?: string;
  name: string;
  category: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  imageUrls?: string[];
  whatsappTemplate?: string;
}

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product, files?: FileList) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Product>({
    name: '',
    category: '',
    description: '',
    sortOrder: 0,
    isActive: true,
    imageUrls: [],
    whatsappTemplate: 'I want to buy {productName} - ID {productId}',
  });
  const [files, setFiles] = useState<FileList | undefined>();

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, files);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{product ? 'Edit' : 'Add'} Product</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required className="w-full p-2 border rounded" />
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" required className="w-full p-2 border rounded" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" rows={4} />
          <input name="sortOrder" type="number" value={formData.sortOrder} onChange={handleChange} placeholder="Sort Order" required className="w-full p-2 border rounded" />
          <textarea name="whatsappTemplate" value={formData.whatsappTemplate} onChange={handleChange} placeholder="WhatsApp Template" className="w-full p-2 border rounded" rows={2} />
          <label className="flex items-center"><input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="mr-2" /> Is Active</label>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Images</label>
            <input name="images" type="file" accept="image/*" onChange={handleFileChange} multiple className="w-full p-2 border rounded" />
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.imageUrls?.map(url => <img key={url} src={url} alt="Product" className="w-24 h-24 object-cover"/>)}
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
