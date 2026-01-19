"use client";
import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { DataTable } from '@/app/components/ui/data-table';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender, ColumnFiltersState, SortingState, ColumnDef } from '@tanstack/react-table';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  displayName?: string;
  email: string;
  phone?: string;
  country?: string;
  createdAt?: any;
  lastLoginAt?: any;
  isAdmin?: boolean;
  status?: 'active' | 'blocked';
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const db = getFirebaseDb();
  const usersCollection = collection(db, 'users');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(usersCollection);
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

    const toggleAdmin = async (user: User) => {
    const functions = getFunctions();
    const setAdminRole = httpsCallable(functions, 'setAdminRole');
    const makeAdmin = !user.isAdmin;

    const promise = setAdminRole({ email: user.email, makeAdmin });

    toast.promise(promise, {
      loading: `Updating ${user.email}...`,
      success: () => {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isAdmin: makeAdmin } : u));
        return `${user.email} is now ${makeAdmin ? 'an admin' : 'a user'}.`;
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const toggleBlockStatus = async (user: User) => {
    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    const userDoc = doc(db, 'users', user.id);
    const promise = updateDoc(userDoc, { status: newStatus });

    toast.promise(promise, {
      loading: 'Updating status...',
      success: () => {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        return `User ${newStatus}.`;
      },
      error: 'Failed to update status.',
    });
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'displayName', header: 'Name', cell: ({ row }) => row.original.displayName || 'N/A' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone', cell: ({ row }) => row.original.phone || 'N/A' },
    { accessorKey: 'country', header: 'Country', cell: ({ row }) => row.original.country || 'N/A' },
    { accessorKey: 'createdAt', header: 'Created At', cell: ({ row }) => row.original.createdAt?.toDate().toLocaleDateString() || 'N/A' },
    { accessorKey: 'lastLoginAt', header: 'Last Login', cell: ({ row }) => row.original.lastLoginAt?.toDate().toLocaleDateString() || 'N/A' },
    { accessorKey: 'isAdmin', header: 'Admin', cell: ({ row }) => (row.original.isAdmin ? 'Yes' : 'No') },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => row.original.status || 'active' },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
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
              <DropdownMenuItem onClick={() => toggleAdmin(user)}>
                {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleBlockStatus(user)}>
                {user.status === 'blocked' ? 'Unblock' : 'Block'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
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

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <DataTable columns={columns} table={table} />
    </div>
  );
}
