"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { DataTable } from '@/app/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/app/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender, ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table';

interface Rule {
  id: string;
  nameNumber: number;
  dobNumber: number;
  primaryStone: string;
  secondaryStone: string;
  priority: number;
  explanation: string;
  disclaimer: string;
  isActive: boolean;
}

export default function FinderRuleManager() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const defaultRuleState: Omit<Rule, 'id'> = { nameNumber: 0, dobNumber: 0, primaryStone: '', secondaryStone: '', priority: 0, explanation: '', disclaimer: '', isActive: true };
  const [newRule, setNewRule] = useState<Omit<Rule, 'id'>>(defaultRuleState);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const db = getFirebaseDb();
  const rulesCollection = collection(db, 'finder_rules');

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const querySnapshot = await getDocs(rulesCollection);
        const rulesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rule));
        setRules(rulesData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch rules.');
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = addDoc(rulesCollection, newRule);
    toast.promise(promise, {
      loading: 'Adding rule...',
      success: (docRef) => {
        setRules(prev => [...prev, { id: docRef.id, ...newRule }]);
        setNewRule(defaultRuleState);
        setIsSheetOpen(false);
        return 'Rule added!';
      },
      error: 'Failed to add rule.',
    });
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    const { id, ...ruleData } = editingRule;
    const ruleDoc = doc(db, 'finder_rules', id);
    const promise = updateDoc(ruleDoc, ruleData);
    toast.promise(promise, {
      loading: 'Updating rule...',
      success: () => {
        setRules(prev => prev.map(r => r.id === id ? editingRule : r));
        setEditingRule(null);
        setIsSheetOpen(false);
        return 'Rule updated!';
      },
      error: 'Failed to update rule.',
    });
  };

  const handleDeleteRule = async (id: string) => {
    const promise = deleteDoc(doc(db, 'finder_rules', id));
    toast.promise(promise, {
      loading: 'Deleting rule...',
      success: () => {
        setRules(prev => prev.filter(r => r.id !== id));
        return 'Rule deleted!';
      },
      error: 'Failed to delete rule.',
    });
  };

  const columns: ColumnDef<Rule>[] = [
    { accessorKey: 'nameNumber', header: 'Name Number' },
    { accessorKey: 'dobNumber', header: 'DOB Number' },
    { accessorKey: 'primaryStone', header: 'Primary Stone' },
    { accessorKey: 'secondaryStone', header: 'Secondary Stone' },
    { accessorKey: 'priority', header: 'Priority' },
    { accessorKey: 'isActive', header: 'Active', cell: ({ row }) => (row.original.isActive ? 'Yes' : 'No') },
    {
        id: 'actions',
        cell: ({ row }) => {
            const rule = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingRule(rule); setIsSheetOpen(true); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteRule(rule.id)} className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
  ];

  const table = useReactTable({
    data: rules,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Finder Rules</h1>
        <Button onClick={() => { setEditingRule(null); setNewRule(defaultRuleState); setIsSheetOpen(true); }}>Add New Rule</Button>
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Filter by Name Number..."
          value={(table.getColumn("nameNumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("nameNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filter by DOB Number..."
          value={(table.getColumn("dobNumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("dobNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
            <Switch 
                id="show-active"
                onCheckedChange={(checked) => table.getColumn("isActive")?.setFilterValue(checked ? 'Yes' : '')}
            />
            <Label htmlFor="show-active">Show Only Active</Label>
        </div>
      </div>
      <DataTable table={table} columns={columns} />
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
            <SheetHeader><SheetTitle>{editingRule ? 'Edit Rule' : 'Add New Rule'}</SheetTitle></SheetHeader>
            <form onSubmit={editingRule ? handleUpdateRule : handleAddRule} className="space-y-4 mt-4">
                <Input type="number" placeholder="Name Number" value={editingRule?.nameNumber ?? newRule.nameNumber} onChange={(e) => editingRule ? setEditingRule({ ...editingRule, nameNumber: Number(e.target.value) }) : setNewRule({ ...newRule, nameNumber: Number(e.target.value) })} required />
                <Input type="number" placeholder="DOB Number" value={editingRule?.dobNumber ?? newRule.dobNumber} onChange={(e) => editingRule ? setEditingRule({ ...editingRule, dobNumber: Number(e.target.value) }) : setNewRule({ ...newRule, dobNumber: Number(e.target.value) })} required />
                <Input placeholder="Primary Stone" value={editingRule?.primaryStone ?? newRule.primaryStone} onChange={(e) => editingRule ? setEditingRule({ ...editingRule, primaryStone: e.target.value }) : setNewRule({ ...newRule, primaryStone: e.target.value })} />
                <Input placeholder="Secondary Stone" value={editingRule?.secondaryStone ?? newRule.secondaryStone} onChange={(e) => editingRule ? setEditingRule({ ...editingRule, secondaryStone: e.target.value }) : setNewRule({ ...newRule, secondaryStone: e.target.value })} />
                <Input type="number" placeholder="Priority / Score" value={editingRule?.priority ?? newRule.priority} onChange={(e) => editingRule ? setEditingRule({ ...editingRule, priority: Number(e.target.value) }) : setNewRule({ ...newRule, priority: Number(e.target.value) })} />
                <Textarea placeholder="Explanation" value={editingRule?.explanation ?? newRule.explanation} onChange={(e) => editingRule ? setEditingRule({ ...editingRule, explanation: e.target.value }) : setNewRule({ ...newRule, explanation: e.target.value })} />
                <Textarea placeholder="Disclaimer" value={editingRule?.disclaimer ?? newRule.disclaimer} onChange={(e) => editingRule ? setEditingRule({ ...editingRule, disclaimer: e.target.value }) : setNewRule({ ...newRule, disclaimer: e.target.value })} />
                <div className="flex items-center space-x-2"><Switch id="isActive" checked={editingRule?.isActive ?? newRule.isActive} onCheckedChange={(checked) => editingRule ? setEditingRule({ ...editingRule, isActive: checked }) : setNewRule({ ...newRule, isActive: checked })} /><Label htmlFor="isActive">Active</Label></div>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingRule ? 'Update' : 'Add'}</Button>
                </div>
            </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
