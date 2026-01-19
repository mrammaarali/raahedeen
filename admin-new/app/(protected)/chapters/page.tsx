import dynamic from 'next/dynamic';

const ChapterManager = dynamic(() => import('./ChapterManager'), { ssr: false });

export default function ChaptersPage() {
  return <ChapterManager />;
}
