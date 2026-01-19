"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProductFaqManager from './ProductFaqManager';
import { DataTable } from '@/app/components/ui/data-table';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, ColumnFiltersState, SortingState, ColumnDef } from '@tanstack/react-table';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import RichTextEditor from '@/app/components/RichTextEditor';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  stoneType: string;
  planet?: string;
  zodiac?: string;
  color?: string;
  sizeWeight?: string;
  priceFrom?: number;
  priceTo?: number;
  isAvailable: boolean;
  images: string[];
  description: string; // long description
  benefits?: string; // short bullet points
  careInstructions?: string;
  whatsappTemplate?: string;
  sortOrder: number;
  isFeatured: boolean;
  status: 'Active' | 'Hidden';
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const defaultProductState: Omit<Product, 'id'> = { name: '', slug: '', category: '', stoneType: '', images: [], description: '', isAvailable: true, sortOrder: 0, isFeatured: false, status: 'Active' };
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(defaultProductState);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const db = getFirebaseDb();
  const storage = getStorage();
  const productsCollection = collection(db, 'products');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(productsCollection);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const uploadImages = async (files: FileList): Promise<string[]> => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    });
    return Promise.all(uploadPromises);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = new Promise<void>(async (resolve, reject) => {
      try {
        let productData = { ...newProduct };
        if (imageFiles && imageFiles.length > 0) {
          const imageUrls = await uploadImages(imageFiles);
          productData.images = imageUrls;
        }
        const docRef = await addDoc(productsCollection, productData);
        setProducts(prev => [...prev, { id: docRef.id, ...productData }]);
        setNewProduct(defaultProductState);
        setImageFiles(null);
        setIsSheetOpen(false);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    toast.promise(promise, { loading: 'Adding product...', success: 'Product added!', error: 'Failed to add product.' });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const promise = new Promise<void>(async (resolve, reject) => {
      try {
        let updatedData = { ...editingProduct };
        if (imageFiles && imageFiles.length > 0) {
          const newImageUrls = await uploadImages(imageFiles);
          updatedData.images = [...(updatedData.images || []), ...newImageUrls];
        }
        const productDoc = doc(db, 'products', editingProduct.id);
        await updateDoc(productDoc, updatedData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedData : p));
        setEditingProduct(null);
        setImageFiles(null);
        setIsSheetOpen(false);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    toast.promise(promise, { loading: 'Updating product...', success: 'Product updated!', error: 'Failed to update product.' });
  };

  const handleDeleteProduct = async (id: string) => {
    const promise = deleteDoc(doc(db, 'products', id));
    toast.promise(promise, {
      loading: 'Deleting product...',
      success: () => {
        setProducts(prev => prev.filter(p => p.id !== id));
        return 'Product deleted!';
      },
      error: 'Failed to delete product.'
    });
  };

  const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="flex items-center space-x-2">
                <img src={row.original.images?.[0]} alt={row.original.name} className="w-10 h-10 object-cover rounded-md" />
                <span>{row.original.name}</span>
            </div>
        )
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "stoneType",
        header: "Stone Type",
    },
    {
        accessorKey: "isAvailable",
        header: "Available",
        cell: ({ row }) => (row.original.isAvailable ? 'Yes' : 'No'),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setEditingProduct(product); setIsSheetOpen(true); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedProductId(product.id)}>Manage FAQs</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  if (selectedProductId) {
    return <ProductFaqManager productId={selectedProductId} onBack={() => setSelectedProductId(null)} />;
  }

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Manage Products</h1>
            <Button onClick={() => { setEditingProduct(null); setNewProduct(defaultProductState); setIsSheetOpen(true); }}>Add New Product</Button>
        </div>
        <DataTable columns={columns} table={table} />
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="w-full max-w-2xl sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</SheetTitle>
                </SheetHeader>
                <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-6 pb-8">
                    <Input placeholder="Name" value={editingProduct?.name ?? newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }) : setNewProduct({ ...newProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} required />
                    <Input placeholder="Slug" value={editingProduct?.slug ?? newProduct.slug} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, slug: e.target.value }) : setNewProduct({ ...newProduct, slug: e.target.value })} required />
                    <Input placeholder="Category (Ring, Pendant, etc.)" value={editingProduct?.category ?? newProduct.category} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, category: e.target.value }) : setNewProduct({ ...newProduct, category: e.target.value })} />
                    <Input placeholder="Stone Type (Emerald, Ruby, etc.)" value={editingProduct?.stoneType ?? newProduct.stoneType} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, stoneType: e.target.value }) : setNewProduct({ ...newProduct, stoneType: e.target.value })} />
                    <Input placeholder="Planet / Zodiac (Optional)" value={editingProduct?.zodiac ?? newProduct.zodiac} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, zodiac: e.target.value }) : setNewProduct({ ...newProduct, zodiac: e.target.value })} />
                    <Input placeholder="Color" value={editingProduct?.color ?? newProduct.color} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, color: e.target.value }) : setNewProduct({ ...newProduct, color: e.target.value })} />
                    <Input placeholder="Size / Weight (e.g., 5-7 ratti)" value={editingProduct?.sizeWeight ?? newProduct.sizeWeight} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, sizeWeight: e.target.value }) : setNewProduct({ ...newProduct, sizeWeight: e.target.value })} />
                    <div className="flex space-x-2">
                        <Input type="number" placeholder="Price From (Optional)" value={editingProduct?.priceFrom ?? newProduct.priceFrom} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, priceFrom: Number(e.target.value) }) : setNewProduct({ ...newProduct, priceFrom: Number(e.target.value) })} />
                        <Input type="number" placeholder="Price To (Optional)" value={editingProduct?.priceTo ?? newProduct.priceTo} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, priceTo: Number(e.target.value) }) : setNewProduct({ ...newProduct, priceTo: Number(e.target.value) })} />
                    </div>
                    <div>
                        <Label>Product Images</Label>
                        <Input type="file" multiple onChange={(e) => setImageFiles(e.target.files)} />
                    </div>
                    <Label>Description (Rich Text)</Label>
                    <RichTextEditor value={editingProduct?.description ?? newProduct.description} onChange={(value) => editingProduct ? setEditingProduct({ ...editingProduct, description: value }) : setNewProduct({ ...newProduct, description: value })} />
                    <Textarea placeholder="Benefits (Short bullet points)" value={editingProduct?.benefits ?? newProduct.benefits} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, benefits: e.target.value }) : setNewProduct({ ...newProduct, benefits: e.target.value })} />
                    <Textarea placeholder="Care Instructions (Optional)" value={editingProduct?.careInstructions ?? newProduct.careInstructions} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, careInstructions: e.target.value }) : setNewProduct({ ...newProduct, careInstructions: e.target.value })} />
                    <Textarea placeholder="WhatsApp Template (Optional)" value={editingProduct?.whatsappTemplate ?? newProduct.whatsappTemplate} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, whatsappTemplate: e.target.value }) : setNewProduct({ ...newProduct, whatsappTemplate: e.target.value })} />
                    <Input type="number" placeholder="Sort Order" value={editingProduct?.sortOrder ?? newProduct.sortOrder} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, sortOrder: Number(e.target.value) }) : setNewProduct({ ...newProduct, sortOrder: Number(e.target.value) })} required />
                    <div className="flex items-center space-x-2"><Switch id="isAvailable" checked={editingProduct?.isAvailable ?? newProduct.isAvailable} onCheckedChange={(checked) => editingProduct ? setEditingProduct({ ...editingProduct, isAvailable: checked }) : setNewProduct({ ...newProduct, isAvailable: checked })} /><Label htmlFor="isAvailable">Available</Label></div>
                    <div className="flex items-center space-x-2"><Switch id="isFeatured" checked={editingProduct?.isFeatured ?? newProduct.isFeatured} onCheckedChange={(checked) => editingProduct ? setEditingProduct({ ...editingProduct, isFeatured: checked }) : setNewProduct({ ...newProduct, isFeatured: checked })} /><Label htmlFor="isFeatured">Featured</Label></div>
                    <Select onValueChange={(value: 'Active' | 'Hidden') => editingProduct ? setEditingProduct({ ...editingProduct, status: value }) : setNewProduct({ ...newProduct, status: value })} value={editingProduct?.status ?? newProduct.status}>
                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Hidden">Hidden</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingProduct ? 'Update Product' : 'Add Product'}</Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    </div>
  );
}
