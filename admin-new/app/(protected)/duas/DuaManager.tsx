"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { DataTable } from '@/app/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { Button } from '@/app/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

interface Dua {
  id: string;
  title: string;
  category: string;
  arabicText: string;
  translationEN: string;
  translationHI?: string;
  translationUR?: string;
  transliteration: string;
  audioUrl?: string;
  tags: string[];
  order: number;
}

export default function DuaManager() {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const defaultDuaState: Omit<Dua, 'id'> = { title: '', category: '', arabicText: '', translationEN: '', transliteration: '', tags: [], order: 0 };
  const [newDua, setNewDua] = useState<Omit<Dua, 'id'>>(defaultDuaState);
  const [editingDua, setEditingDua] = useState<Dua | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const db = getFirebaseDb();
  const duasCollection = collection(db, 'duas');

  useEffect(() => {
    const fetchDuas = async () => {
      try {
        const querySnapshot = await getDocs(duasCollection);
        const duasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dua));
        setDuas(duasData.sort((a, b) => a.order - b.order));
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch duas.');
      } finally {
        setLoading(false);
      }
    };

    fetchDuas();
  }, []);

  const handleAddDua = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = addDoc(duasCollection, newDua);
    toast.promise(promise, {
      loading: 'Adding dua...',
      success: (docRef) => {
        setDuas(prev => [...prev, { id: docRef.id, ...newDua }].sort((a, b) => a.order - b.order));
        setNewDua(defaultDuaState);
        setIsSheetOpen(false);
        return 'Dua added!';
      },
      error: 'Failed to add dua.',
    });
  };

  const handleUpdateDua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDua) return;
    const { id, ...duaData } = editingDua;
    const duaDoc = doc(db, 'duas', id);
    const promise = updateDoc(duaDoc, duaData);
    toast.promise(promise, {
      loading: 'Updating dua...',
      success: () => {
        setDuas(prev => prev.map(d => d.id === id ? editingDua : d).sort((a, b) => a.order - b.order));
        setEditingDua(null);
        setIsSheetOpen(false);
        return 'Dua updated!';
      },
      error: 'Failed to update dua.',
    });
  };

  const handleDeleteDua = async (id: string) => {
    const promise = deleteDoc(doc(db, 'duas', id));
    toast.promise(promise, {
      loading: 'Deleting dua...',
      success: () => {
        setDuas(prev => prev.filter(d => d.id !== id));
        return 'Dua deleted!';
      },
      error: 'Failed to delete dua.',
    });
  };

  const columns: ColumnDef<Dua>[] = [
    { accessorKey: 'order', header: 'Order' },
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'tags', header: 'Tags', cell: ({ row }) => row.original.tags.join(', ') },
    {
        id: 'actions',
        cell: ({ row }) => {
            const dua = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingDua(dua); setIsSheetOpen(true); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteDua(dua.id)} className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
  ];

  const table = useReactTable({
    data: duas,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  if (loading) return <p>Loading duas...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Duas</h1>
        <Button onClick={() => { setEditingDua(null); setNewDua(defaultDuaState); setIsSheetOpen(true); }}>Add New Dua</Button>
      </div>
      <DataTable table={table} columns={columns} />
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full max-w-2xl sm:max-w-2xl overflow-y-auto">
            <SheetHeader><SheetTitle>{editingDua ? 'Edit Dua' : 'Add New Dua'}</SheetTitle></SheetHeader>
            <form onSubmit={editingDua ? handleUpdateDua : handleAddDua} className="space-y-4 mt-4 pb-8">
                <Input placeholder="Title" value={editingDua?.title ?? newDua.title} onChange={(e) => editingDua ? setEditingDua({ ...editingDua, title: e.target.value }) : setNewDua({ ...newDua, title: e.target.value })} required />
                <Input placeholder="Category (e.g., Protection, Rizq)" value={editingDua?.category ?? newDua.category} onChange={(e) => editingDua ? setEditingDua({ ...editingDua, category: e.target.value }) : setNewDua({ ...newDua, category: e.target.value })} required />
                <Textarea placeholder="Arabic Text" value={editingDua?.arabicText ?? newDua.arabicText} onChange={(e) => editingDua ? setEditingDua({ ...editingDua, arabicText: e.target.value }) : setNewDua({ ...newDua, arabicText: e.target.value })} required />
                <Textarea placeholder="English Translation" value={editingDua?.translationEN ?? newDua.translationEN} onChange={(e) => editingDua ? setEditingDua({ ...editingDua, translationEN: e.target.value }) : setNewDua({ ...newDua, translationEN: e.target.value })} required />
                <Textarea placeholder="Hindi/Urdu Translation (Optional)" value={editingDua?.translationHI ?? newDua.translationHI} onChange={(e) => editingDua ? setEditingDua({ ...editingDua, translationHI: e.target.value }) : setNewDua({ ...newDua, translationHI: e.target.value })} />
                <Textarea placeholder="Transliteration" value={editingDua?.transliteration ?? newDua.transliteration} onChange={(e) => editingDua ? setEditingDua({ ...editingDua, transliteration: e.target.value }) : setNewDua({ ...newDua, transliteration: e.target.value })} required />
                <Input placeholder="Audio URL (Optional)" value={editingDua?.audioUrl ?? newDua.audioUrl} onChange={(e) => editingDua ? setEditingDua({ ...editingDua, audioUrl: e.target.value }) : setNewDua({ ...newDua, audioUrl: e.target.value })} />
                <Input placeholder="Tags (comma-separated)" value={(editingDua?.tags ?? newDua.tags).join(', ')} onChange={(e) => {
                    const tags = e.target.value.split(',').map(t => t.trim());
                    editingDua ? setEditingDua({ ...editingDua, tags }) : setNewDua({ ...newDua, tags });
                }} />
                <Input type="number" placeholder="Order" value={editingDua?.order ?? newDua.order} onChange={(e) => editingDua ? setEditingDua({ ...editingDua, order: Number(e.target.value) }) : setNewDua({ ...newDua, order: Number(e.target.value) })} required />
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingDua ? 'Update Dua' : 'Add Dua'}</Button>
                </div>
            </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
