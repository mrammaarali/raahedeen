import dynamic from 'next/dynamic';

const UserManager = dynamic(() => import('./UserManager'), {
  ssr: false,
  loading: () => <p>Loading Users...</p>,
});

export default function UsersPage() {
  return <UserManager />;
}
