import dynamic from 'next/dynamic';

const FinderRequestViewer = dynamic(() => import('./FinderRequestViewer'), {
  ssr: false,
  loading: () => <p>Loading Finder Requests...</p>,
});

export default function FinderRequestsPage() {
  return <FinderRequestViewer />;
}
