import dynamic from 'next/dynamic';

const ChapterManager = dynamic(() => import('./ChapterManager'), {
  ssr: false,
  loading: () => <p>Loading Chapters...</p>,
});

export default function ChaptersPage() {
  return <ChapterManager />;
}
