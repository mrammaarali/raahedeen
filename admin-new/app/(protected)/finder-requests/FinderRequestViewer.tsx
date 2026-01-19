"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { DataTable } from '@/app/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import toast from 'react-hot-toast';

interface FinderRequest {
  id: string;
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  dob: string;
  problem: string;
  recommendedStone?: string;
  ruleApplied?: string;
  status: 'new' | 'reviewed';
  createdAt: any;
}

export default function FinderRequestViewer() {
  const [requests, setRequests] = useState<FinderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed'>('all');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const db = getFirebaseDb();
  const requestsCollection = collection(db, 'finder_requests');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        let q;
        if (statusFilter === 'all') {
          q = query(requestsCollection, orderBy('createdAt', 'desc'));
        } else {
          q = query(requestsCollection, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
        }
        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinderRequest));
        setRequests(requestsData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [statusFilter]);

  const handleMarkAsReviewed = async (id: string) => {
    const requestDoc = doc(db, 'finder_requests', id);
    const promise = updateDoc(requestDoc, { status: 'reviewed' });
    toast.promise(promise, {
      loading: 'Updating status...',
      success: () => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'reviewed' } : r));
        return 'Marked as reviewed!';
      },
      error: 'Failed to update status.',
    });
  };

  const columns: ColumnDef<FinderRequest>[] = [
    { 
        accessorKey: 'name', 
        header: 'User Info',
        cell: ({ row }) => (
            <div>
                <p className="font-bold">{row.original.name}</p>
                <p className="text-sm text-gray-500">{row.original.email || row.original.phone}</p>
                <p className="text-xs text-gray-600">{row.original.uid}</p>
            </div>
        )
    },
    { 
        accessorKey: 'dob', 
        header: 'Entered Details',
        cell: ({ row }) => (
            <div>
                <p><strong>DOB:</strong> {row.original.dob}</p>
                <p><strong>Problem:</strong> {row.original.problem}</p>
            </div>
        )
    },
    { 
        accessorKey: 'recommendedStone', 
        header: 'Recommendation',
        cell: ({ row }) => (
            <div>
                <p><strong>Stone:</strong> {row.original.recommendedStone || 'N/A'}</p>
                <p className="text-sm text-gray-500"><strong>Rule:</strong> {row.original.ruleApplied || 'N/A'}</p>
            </div>
        )
    },
    { accessorKey: 'status', header: 'Status' },
    { 
        accessorKey: 'createdAt', 
        header: 'Date',
        cell: ({ row }) => row.original.createdAt?.toDate().toLocaleString()
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <Button 
                onClick={() => handleMarkAsReviewed(row.original.id)} 
                disabled={row.original.status === 'reviewed'}
            >
                Mark as Reviewed
            </Button>
        )
    }
  ];

  const table = useReactTable({
    data: requests,
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Finder Requests</h1>
        <Select onValueChange={(value: 'all' | 'new' | 'reviewed') => setStatusFilter(value)} value={statusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <DataTable table={table} columns={columns} />
      )}
    </div>
  );
}
