import dynamic from 'next/dynamic';

const DuaManager = dynamic(() => import('./DuaManager'), {
  ssr: false,
  loading: () => <p>Loading Duas...</p>,
});

export default function DuasPage() {
  return <DuaManager />;
}
