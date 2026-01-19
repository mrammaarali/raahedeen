import dynamic from 'next/dynamic';

const DuaManager = dynamic(() => import('./DuaManager'), { ssr: false });

export default function DuasPage() {
  return <DuaManager />;
}
