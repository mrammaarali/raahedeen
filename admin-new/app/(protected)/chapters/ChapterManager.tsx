"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { DataTable } from '@/app/components/ui/data-table';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, ColumnFiltersState, SortingState, ColumnDef } from '@tanstack/react-table';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Input } from '@/app/components/ui/input';
import toast from 'react-hot-toast';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Chapter {
  id: string;
  order: number;
  title: string;
  description?: string;
  category?: string;
  language: 'EN' | 'HI' | 'UR' | 'AR';
  audioUrl: string;
  isFree: boolean;
  isFeatured: boolean;
  status: 'Active' | 'Hidden';
  duration: number;
}

export default function ChapterManager() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const defaultChapterState: Omit<Chapter, 'id'> = { order: 0, title: '', audioUrl: '', duration: 0, language: 'EN', isFree: false, isFeatured: false, status: 'Active', description: '', category: '' };
  const [newChapter, setNewChapter] = useState<Omit<Chapter, 'id'>>(defaultChapterState);
  const storage = getStorage();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioSourceType, setAudioSourceType] = useState<'upload' | 'url'>('url');
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const db = getFirebaseDb();
  const chaptersCollection = collection(db, 'audiobook_chapters');

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const querySnapshot = await getDocs(chaptersCollection);
        const chaptersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
        setChapters(chaptersData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch chapters.');
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = new Promise<void>(async (resolve, reject) => {
      try {
        let chapterData = { ...newChapter };
        if (audioSourceType === 'upload' && audioFile) {
          const storageRef = ref(storage, `audiobook_chapters/${audioFile.name}`);
          await uploadBytes(storageRef, audioFile);
          chapterData.audioUrl = await getDownloadURL(storageRef);
        }
        const docRef = await addDoc(chaptersCollection, chapterData);
        setChapters(prev => [...prev, { id: docRef.id, ...chapterData }].sort((a, b) => a.order - b.order));
        setNewChapter(defaultChapterState);
        setAudioFile(null);
        setIsSheetOpen(false);
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Adding chapter...',
      success: 'Chapter added successfully!',
      error: 'Failed to add chapter.',
    });
  };

  const handleUpdateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;

    const promise = new Promise<void>(async (resolve, reject) => {
      try {
        let updatedData = { ...editingChapter };
        if (audioSourceType === 'upload' && audioFile) {
          const storageRef = ref(storage, `audiobook_chapters/${audioFile.name}`);
          await uploadBytes(storageRef, audioFile);
          updatedData.audioUrl = await getDownloadURL(storageRef);
        }
        const chapterDoc = doc(db, 'audiobook_chapters', editingChapter.id);
        await updateDoc(chapterDoc, updatedData);

        setChapters(prev => prev.map(c => c.id === editingChapter.id ? updatedData : c).sort((a, b) => a.order - b.order));
        setEditingChapter(null);
        setAudioFile(null);
        setIsSheetOpen(false);
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Updating chapter...',
      success: 'Chapter updated successfully!',
      error: 'Failed to update chapter.',
    });
  };

  const handleDuplicateChapter = async (chapter: Chapter) => {
    const { id, ...chapterData } = chapter;
    const newChapterData = { ...chapterData, title: `${chapter.title} (Copy)`, order: chapters.length + 1 };
    const promise = addDoc(chaptersCollection, newChapterData);
    toast.promise(promise, {
      loading: 'Duplicating chapter...',
      success: (docRef) => {
        setChapters(prev => [...prev, { id: docRef.id, ...newChapterData }].sort((a, b) => a.order - b.order));
        return 'Chapter duplicated successfully!';
      },
      error: 'Failed to duplicate chapter.',
    });
  };

  const handleDeleteChapter = async (id: string) => {
    const promise = deleteDoc(doc(db, 'audiobook_chapters', id));
    toast.promise(promise, {
      loading: 'Deleting chapter...',
      success: () => {
        setChapters(prev => prev.filter(c => c.id !== id));
        return 'Chapter deleted successfully!';
      },
      error: 'Failed to delete chapter.',
    });
  };

  const columns: ColumnDef<Chapter>[] = [
    {
        accessorKey: "order",
        header: "Order",
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration (s)",
      cell: ({ row }) => `${row.original.duration}s`,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const chapter = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(chapter.id)}>
                Copy Chapter ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setEditingChapter(chapter); setIsSheetOpen(true); }}>Edit Chapter</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicateChapter(chapter)}>Duplicate Chapter</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteChapter(chapter.id)} className="text-red-500">Delete Chapter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: chapters,
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

  if (loading) return <p>Loading chapters...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Chapters</h1>
        <Button onClick={() => { setEditingChapter(null); setNewChapter(defaultChapterState); setIsSheetOpen(true); }}>Add New Chapter</Button>
      </div>
      <DataTable columns={columns} table={table} />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingChapter ? 'Edit Chapter' : 'Add New Chapter'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={editingChapter ? handleUpdateChapter : handleAddChapter} className="space-y-4 mt-4">
            <Input type="number" placeholder="Order" value={editingChapter?.order ?? newChapter.order} onChange={(e: React.ChangeEvent<HTMLInputElement>) => editingChapter ? setEditingChapter({ ...editingChapter, order: Number(e.target.value) }) : setNewChapter({ ...newChapter, order: Number(e.target.value) })} required />
            <Input type="text" placeholder="Title" value={editingChapter?.title ?? newChapter.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => editingChapter ? setEditingChapter({ ...editingChapter, title: e.target.value }) : setNewChapter({ ...newChapter, title: e.target.value })} required />
            <Textarea placeholder="Description" value={editingChapter?.description ?? newChapter.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => editingChapter ? setEditingChapter({ ...editingChapter, description: e.target.value }) : setNewChapter({ ...newChapter, description: e.target.value })} />
            <Input type="text" placeholder="Category / Surah" value={editingChapter?.category ?? newChapter.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => editingChapter ? setEditingChapter({ ...editingChapter, category: e.target.value }) : setNewChapter({ ...newChapter, category: e.target.value })} />
            <Select onValueChange={(value: 'EN' | 'HI' | 'UR' | 'AR') => editingChapter ? setEditingChapter({ ...editingChapter, language: value }) : setNewChapter({ ...newChapter, language: value })} value={editingChapter?.language ?? newChapter.language}>
                <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="EN">English</SelectItem>
                    <SelectItem value="HI">Hindi</SelectItem>
                    <SelectItem value="UR">Urdu</SelectItem>
                    <SelectItem value="AR">Arabic</SelectItem>
                </SelectContent>
            </Select>
            <Select onValueChange={(value: 'upload' | 'url') => setAudioSourceType(value)} defaultValue={audioSourceType}>
                 <SelectTrigger><SelectValue placeholder="Audio Source" /></SelectTrigger>
                 <SelectContent>
                    <SelectItem value="url">External URL</SelectItem>
                    <SelectItem value="upload">Upload File</SelectItem>
                 </SelectContent>
            </Select>
            {audioSourceType === 'url' ? (
                <Input type="text" placeholder="Audio URL" value={editingChapter?.audioUrl ?? newChapter.audioUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => editingChapter ? setEditingChapter({ ...editingChapter, audioUrl: e.target.value }) : setNewChapter({ ...newChapter, audioUrl: e.target.value })} required />
            ) : (
                <Input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAudioFile(e.target.files ? e.target.files[0] : null)} required={!editingChapter} />
            )}
            <Input type="number" placeholder="Duration (seconds)" value={editingChapter?.duration ?? newChapter.duration} onChange={(e: React.ChangeEvent<HTMLInputElement>) => editingChapter ? setEditingChapter({ ...editingChapter, duration: Number(e.target.value) }) : setNewChapter({ ...newChapter, duration: Number(e.target.value) })} required />
            <div className="flex items-center space-x-2"><Switch id="isFree" checked={editingChapter?.isFree ?? newChapter.isFree} onCheckedChange={(checked: boolean) => editingChapter ? setEditingChapter({ ...editingChapter, isFree: checked }) : setNewChapter({ ...newChapter, isFree: checked })} /><Label htmlFor="isFree">Free</Label></div>
            <div className="flex items-center space-x-2"><Switch id="isFeatured" checked={editingChapter?.isFeatured ?? newChapter.isFeatured} onCheckedChange={(checked: boolean) => editingChapter ? setEditingChapter({ ...editingChapter, isFeatured: checked }) : setNewChapter({ ...newChapter, isFeatured: checked })} /><Label htmlFor="isFeatured">Featured</Label></div>
            <Select onValueChange={(value: 'Active' | 'Hidden') => editingChapter ? setEditingChapter({ ...editingChapter, status: value }) : setNewChapter({ ...newChapter, status: value })} value={editingChapter?.status ?? newChapter.status}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Hidden">Hidden</SelectItem>
                </SelectContent>
            </Select>
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                <Button type="submit">{editingChapter ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
