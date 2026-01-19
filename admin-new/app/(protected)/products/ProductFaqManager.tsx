"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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

interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
  visible: boolean;
}

interface ProductFaqManagerProps {
  productId: string;
  onBack: () => void;
}

export default function ProductFaqManager({ productId, onBack }: ProductFaqManagerProps) {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const defaultFaqState: Omit<Faq, 'id'> = { question: '', answer: '', order: 0, visible: true };
  const [newFaq, setNewFaq] = useState<Omit<Faq, 'id'>>(defaultFaqState);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const db = getFirebaseDb();
  const faqsCollection = collection(db, 'products', productId, 'faqs');

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const querySnapshot = await getDocs(faqsCollection);
        const faqsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Faq));
        setFaqs(faqsData.sort((a, b) => a.order - b.order));
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch FAQs.');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [productId]);

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = new Promise<void>(async (resolve, reject) => {
      try {
        const docRef = await addDoc(faqsCollection, newFaq);
        setFaqs(prev => [...prev, { id: docRef.id, ...newFaq }].sort((a, b) => a.order - b.order));
        setNewFaq(defaultFaqState);
        setIsSheetOpen(false);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    toast.promise(promise, { loading: 'Adding FAQ...', success: 'FAQ added!', error: 'Failed to add FAQ.' });
  };

  const handleUpdateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    const promise = new Promise<void>(async (resolve, reject) => {
      try {
        const { id, ...dataToUpdate } = editingFaq;
        const faqDoc = doc(db, 'products', productId, 'faqs', id);
        await updateDoc(faqDoc, dataToUpdate);
        setFaqs(prev => prev.map(f => f.id === editingFaq.id ? editingFaq : f).sort((a, b) => a.order - b.order));
        setEditingFaq(null);
        setIsSheetOpen(false);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    toast.promise(promise, { loading: 'Updating FAQ...', success: 'FAQ updated!', error: 'Failed to update FAQ.' });
  };

  const handleDeleteFaq = async (id: string) => {
    const promise = deleteDoc(doc(db, 'products', productId, 'faqs', id));
    toast.promise(promise, {
      loading: 'Deleting FAQ...',
      success: () => {
        setFaqs(prev => prev.filter(f => f.id !== id));
        return 'FAQ deleted!';
      },
      error: 'Failed to delete FAQ.'
    });
  };

  const columns: ColumnDef<Faq>[] = [
    {
        accessorKey: "order",
        header: "Order",
    },
    {
        accessorKey: "question",
        header: "Question",
    },
    {
        accessorKey: "answer",
        header: "Answer",
    },
    {
        accessorKey: "visible",
        header: "Visible",
        cell: ({ row }) => (row.original.visible ? 'Yes' : 'No'),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const faq = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setEditingFaq(faq); setIsSheetOpen(true); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteFaq(faq.id)} className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
  ];

  const table = useReactTable({
    data: faqs,
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

  if (loading) return <p>Loading FAQs...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <div>
                <Button variant="outline" onClick={onBack} className="mb-4">Back to Products</Button>
                <h1 className="text-2xl font-bold">Manage FAQs for Product</h1>
            </div>
            <Button onClick={() => { setEditingFaq(null); setNewFaq(defaultFaqState); setIsSheetOpen(true); }}>Add New FAQ</Button>
        </div>
        <DataTable columns={columns} table={table} />
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</SheetTitle>
                </SheetHeader>
                <form onSubmit={editingFaq ? handleUpdateFaq : handleAddFaq} className="space-y-4 mt-4">
                    <Input placeholder="Question" value={editingFaq?.question ?? newFaq.question} onChange={(e) => editingFaq ? setEditingFaq({ ...editingFaq, question: e.target.value }) : setNewFaq({ ...newFaq, question: e.target.value })} required />
                    <Textarea placeholder="Answer" value={editingFaq?.answer ?? newFaq.answer} onChange={(e) => editingFaq ? setEditingFaq({ ...editingFaq, answer: e.target.value }) : setNewFaq({ ...newFaq, answer: e.target.value })} required />
                    <Input type="number" placeholder="Order" value={editingFaq?.order ?? newFaq.order} onChange={(e) => editingFaq ? setEditingFaq({ ...editingFaq, order: Number(e.target.value) }) : setNewFaq({ ...newFaq, order: Number(e.target.value) })} required />
                    <div className="flex items-center space-x-2"><Switch id="isVisible" checked={editingFaq?.visible ?? newFaq.visible} onCheckedChange={(checked) => editingFaq ? setEditingFaq({ ...editingFaq, visible: checked }) : setNewFaq({ ...newFaq, visible: checked })} /><Label htmlFor="isVisible">Visible</Label></div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingFaq ? 'Update FAQ' : 'Add FAQ'}</Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    </div>
  );
}
