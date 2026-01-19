import dynamic from 'next/dynamic';

const FinderRequestViewer = dynamic(() => import('./FinderRequestViewer'), { ssr: false });

export default function FinderRequestsPage() {
  return <FinderRequestViewer />;
}
