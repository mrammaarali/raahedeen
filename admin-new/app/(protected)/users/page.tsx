import dynamic from 'next/dynamic';

const UserManager = dynamic(() => import('./UserManager'), { ssr: false });

export default function UsersPage() {
  return <UserManager />;
}
