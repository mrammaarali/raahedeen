"use client";

import { useAuthContext } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAdminAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const { user, isAdmin, loading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user || !isAdmin) {
          router.push('/login');
        }
      }
    }, [user, isAdmin, loading, router]);

    if (loading || !user || !isAdmin) {
      return <div>Loading...</div>; // Or a spinner component
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAdminAuth;
